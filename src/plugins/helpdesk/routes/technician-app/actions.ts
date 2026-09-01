"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/contexts/auth";
import { uploadTicketAttachmentMediaAsset } from "@/contexts/media";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import {
  addComment,
  addTicketAttachment,
  assignTicket,
  changePriority,
  changeStatus,
  MAX_TICKET_ATTACHMENTS_PER_SCOPE,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/plugins/helpdesk";
import type { TicketPriority, TicketStatus } from "@/plugins/helpdesk";

// App do técnico (§4) — mesma camada features/ do admin, só revalidando a rota do app. As guardas
// (helpdesk.work na fila, só o assignee/gestor resolve, só helpdesk.manage fecha) ficam nos
// handlers/ticket-state, não aqui.
export type TechActionState = { error: string | null };

const RETURN_TO = "/chamados/tecnico";
const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

function photoFiles(formData: FormData): File[] {
  return formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function uploadPhotos(files: File[]): Promise<{ mediaIds: string[]; error: string | null }> {
  const mediaIds: string[] = [];
  for (const file of files.slice(0, MAX_TICKET_ATTACHMENTS_PER_SCOPE)) {
    const data = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadTicketAttachmentMediaAsset({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      data,
    });
    if (!uploaded.success) return { mediaIds, error: uploaded.error.message };
    mediaIds.push(uploaded.data.id);
  }
  return { mediaIds, error: null };
}

export async function techChangeStatusAction(_prev: TechActionState, formData: FormData): Promise<TechActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const to = String(formData.get("to") ?? "");
  if (!(TICKET_STATUSES as readonly string[]).includes(to)) return { error: "Status inválido." };

  const note = String(formData.get("note") ?? "").trim();
  const result = await changeStatus({
    ticketId: String(formData.get("ticketId") ?? ""),
    to: to as TicketStatus,
    note: note.length > 0 ? note : null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function techChangePriorityAction(_prev: TechActionState, formData: FormData): Promise<TechActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const priority = String(formData.get("priority") ?? "");
  if (!(TICKET_PRIORITIES as readonly string[]).includes(priority)) return { error: "Prioridade inválida." };

  const result = await changePriority({
    ticketId: String(formData.get("ticketId") ?? ""),
    priority: priority as TicketPriority,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function techAddCommentAction(_prev: TechActionState, formData: FormData): Promise<TechActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const ticketId = String(formData.get("ticketId") ?? "");
  const visibility = String(formData.get("visibility") ?? "public") === "internal" ? "internal" : "public";

  const files = photoFiles(formData);
  if (files.length > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return { error: `Anexe no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} fotos.` };
  }

  const result = await addComment({ ticketId, body: String(formData.get("body") ?? ""), visibility });
  if (!result.success) return { error: result.error.message };

  if (files.length > 0) {
    const { mediaIds, error: uploadError } = await uploadPhotos(files);
    if (uploadError) return { error: uploadError };
    const attached = await addTicketAttachment({ ticketId, eventId: result.data.event.id, mediaIds });
    if (!attached.success) return { error: attached.error.message };
  }

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function techAssignToMeAction(_prev: TechActionState, formData: FormData): Promise<TechActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) return { error: "É necessário estar autenticado." };

  const result = await assignTicket({
    ticketId: String(formData.get("ticketId") ?? ""),
    assigneeUserId: currentUser.data.id,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
