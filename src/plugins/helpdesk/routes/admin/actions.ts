"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import {
  archiveCategory,
  archiveQueue,
  createCategory,
  createQueue,
  setQueueMembers,
  updateCategory,
  updateQueue,
  type QueueMemberAssignment,
} from "@/plugins/helpdesk";
import {
  QUEUE_MEMBER_ROLES,
  TICKET_PRIORITIES,
  type QueueMemberRole,
  type TicketPriority,
} from "@/plugins/helpdesk/contracts/types";

export type HelpdeskActionState = { error: string | null };

const RETURN_TO = "/admin/helpdesk";
const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

function optional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

function priority(formData: FormData, name: string): TicketPriority | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return (TICKET_PRIORITIES as readonly string[]).includes(value) ? (value as TicketPriority) : undefined;
}

// members chega como JSON [{ userId, role }] num input hidden — o cliente monta a lista com
// pickers (sem UUID digitado). Linha inválida vira erro de validação no service.
function parseMembers(raw: string): QueueMemberAssignment[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((entry): entry is { userId: string; role: string } => {
      return Boolean(entry) && typeof entry === "object" && "userId" in entry && "role" in entry;
    })
    .map((entry) => ({
      userId: String(entry.userId),
      role: (QUEUE_MEMBER_ROLES as readonly string[]).includes(entry.role) ? (entry.role as QueueMemberRole) : "agent",
    }));
}

export async function createQueueAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createQueue({
    name: String(formData.get("name") ?? ""),
    description: optional(formData, "description") ?? null,
    icon: optional(formData, "icon") ?? null,
    defaultPriority: priority(formData, "defaultPriority"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateQueueAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateQueue({
    queueId: String(formData.get("queueId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: optional(formData, "description") ?? null,
    icon: optional(formData, "icon") ?? null,
    defaultPriority: priority(formData, "defaultPriority"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function archiveQueueAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await archiveQueue({
    queueId: String(formData.get("queueId") ?? ""),
    archived: String(formData.get("archived") ?? "") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function setQueueMembersAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setQueueMembers({
    queueId: String(formData.get("queueId") ?? ""),
    members: parseMembers(String(formData.get("membersJson") ?? "[]")),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function createCategoryAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createCategory({
    queueId: String(formData.get("queueId") ?? ""),
    label: String(formData.get("label") ?? ""),
    description: optional(formData, "description") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateCategoryAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateCategory({
    categoryId: String(formData.get("categoryId") ?? ""),
    label: String(formData.get("label") ?? ""),
    description: optional(formData, "description") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function archiveCategoryAction(_prev: HelpdeskActionState, formData: FormData): Promise<HelpdeskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await archiveCategory({
    categoryId: String(formData.get("categoryId") ?? ""),
    archived: String(formData.get("archived") ?? "") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
