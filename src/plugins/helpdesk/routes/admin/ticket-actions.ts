"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { assignTicket, addComment, changeStatus, changePriority, TICKET_PRIORITIES, TICKET_STATUSES } from "@/plugins/helpdesk";
import type { TicketPriority, TicketStatus, TicketEventVisibility } from "@/plugins/helpdesk";

export type HelpdeskTicketActionState = { error: string | null };

const RETURN_TO = "/admin/helpdesk";
const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

export async function assignTicketAction(
  _prev: HelpdeskTicketActionState,
  formData: FormData,
): Promise<HelpdeskTicketActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const raw = String(formData.get("assigneeUserId") ?? "");
  const result = await assignTicket({
    ticketId: String(formData.get("ticketId") ?? ""),
    assigneeUserId: raw.trim().length > 0 ? raw : null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function changeTicketStatusAction(
  _prev: HelpdeskTicketActionState,
  formData: FormData,
): Promise<HelpdeskTicketActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const to = String(formData.get("to") ?? "");
  if (!(TICKET_STATUSES as readonly string[]).includes(to)) {
    return { error: "Status inválido." };
  }

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

export async function changeTicketPriorityAction(
  _prev: HelpdeskTicketActionState,
  formData: FormData,
): Promise<HelpdeskTicketActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const priority = String(formData.get("priority") ?? "");
  if (!(TICKET_PRIORITIES as readonly string[]).includes(priority)) {
    return { error: "Prioridade inválida." };
  }

  const result = await changePriority({
    ticketId: String(formData.get("ticketId") ?? ""),
    priority: priority as TicketPriority,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function addTicketNoteAction(
  _prev: HelpdeskTicketActionState,
  formData: FormData,
): Promise<HelpdeskTicketActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const visibility = String(formData.get("visibility") ?? "internal") as TicketEventVisibility;
  const result = await addComment({
    ticketId: String(formData.get("ticketId") ?? ""),
    body: String(formData.get("body") ?? ""),
    visibility: visibility === "public" ? "public" : "internal",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
