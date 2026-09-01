"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { createBoard, deleteBoard, updateBoard, type BoardLayout } from "@/plugins/helpdesk";

export type HelpdeskBoardActionState = { error: string | null };

const RETURN_TO = "/admin/helpdesk";
const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

function optional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

function layoutOf(formData: FormData): BoardLayout {
  return String(formData.get("layout") ?? "") === "open_list" ? "open_list" : "kanban";
}

function refreshOf(formData: FormData): number {
  const parsed = Number.parseInt(String(formData.get("refreshSeconds") ?? ""), 10);
  return Number.isNaN(parsed) ? 20 : parsed;
}

export async function createBoardAction(
  _prev: HelpdeskBoardActionState,
  formData: FormData,
): Promise<HelpdeskBoardActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createBoard({
    label: String(formData.get("label") ?? ""),
    queueId: optional(formData, "queueId") ?? null,
    layout: layoutOf(formData),
    showAssignee: String(formData.get("showAssignee") ?? "") === "true",
    refreshSeconds: refreshOf(formData),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateBoardAction(
  _prev: HelpdeskBoardActionState,
  formData: FormData,
): Promise<HelpdeskBoardActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateBoard({
    boardId: String(formData.get("boardId") ?? ""),
    label: String(formData.get("label") ?? ""),
    queueId: optional(formData, "queueId") ?? null,
    layout: layoutOf(formData),
    showAssignee: String(formData.get("showAssignee") ?? "") === "true",
    refreshSeconds: refreshOf(formData),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function deleteBoardAction(
  _prev: HelpdeskBoardActionState,
  formData: FormData,
): Promise<HelpdeskBoardActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteBoard({ boardId: String(formData.get("boardId") ?? "") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
