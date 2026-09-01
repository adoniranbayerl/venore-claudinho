"use server";

import { revalidatePath } from "next/cache";
import { uploadTicketAttachmentMediaAsset } from "@/contexts/media";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { addComment, addTicketAttachment, openTicket, MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "@/plugins/helpdesk";

export type PortalActionState = { error: string | null; reference?: string | null };

const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

function optional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

// Faz o upload de cada foto (até MAX_TICKET_ATTACHMENTS_PER_SCOPE) por
// uploadTicketAttachmentMediaAsset (ator autenticado, categoria reservada, limite de tamanho) e
// devolve os mediaIds. Para na primeira falha.
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
    if (!uploaded.success) {
      return { mediaIds, error: uploaded.error.message };
    }
    mediaIds.push(uploaded.data.id);
  }
  return { mediaIds, error: null };
}

function photoFiles(formData: FormData): File[] {
  return formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function openTicketAction(_prev: PortalActionState, formData: FormData): Promise<PortalActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const files = photoFiles(formData);
  if (files.length > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return { error: `Anexe no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} fotos.` };
  }

  const { mediaIds, error: uploadError } = await uploadPhotos(files);
  if (uploadError) return { error: uploadError };

  const result = await openTicket({
    queueId: String(formData.get("queueId") ?? ""),
    categoryId: optional(formData, "categoryId") ?? null,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    location: optional(formData, "location") ?? null,
    attachmentMediaIds: mediaIds,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath("/chamados");
  return { error: null, reference: result.data.reference };
}

export async function addTicketCommentAction(_prev: PortalActionState, formData: FormData): Promise<PortalActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const ticketId = String(formData.get("ticketId") ?? "");
  const reference = String(formData.get("reference") ?? "");

  const result = await addComment({ ticketId, body: String(formData.get("body") ?? ""), visibility: "public" });
  if (!result.success) return { error: result.error.message };

  const files = photoFiles(formData);
  if (files.length > 0) {
    const { mediaIds, error: uploadError } = await uploadPhotos(files);
    if (uploadError) return { error: uploadError };
    const attached = await addTicketAttachment({ ticketId, eventId: result.data.event.id, mediaIds });
    if (!attached.success) return { error: attached.error.message };
  }

  if (reference) revalidatePath(`/chamados/${reference}`);
  return { error: null };
}
