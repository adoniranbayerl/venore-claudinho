"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { setSlaPolicy } from "@/plugins/helpdesk";
import { TICKET_PRIORITIES, type TicketPriority } from "@/plugins/helpdesk/contracts/types";

export type HelpdeskSlaActionState = { error: string | null };

const RETURN_TO = "/admin/helpdesk";
const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

// O formulário do sla-editor manda os prazos em HORAS (campo guiado, sem jargão de "minutos") — a
// action converte para minutos, a unidade que sla_policies guarda.
function hoursToMinutes(formData: FormData, name: string): number {
  const hours = Number(String(formData.get(name) ?? "").replace(",", "."));
  if (!Number.isFinite(hours) || hours <= 0) return NaN;
  return Math.round(hours * 60);
}

export async function saveSlaPolicyAction(
  _prev: HelpdeskSlaActionState,
  formData: FormData,
): Promise<HelpdeskSlaActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const rawPriority = String(formData.get("priority") ?? "");
  if (!(TICKET_PRIORITIES as readonly string[]).includes(rawPriority)) {
    return { error: "Prioridade inválida." };
  }

  const firstResponseMinutes = hoursToMinutes(formData, "firstResponseHours");
  const resolutionMinutes = hoursToMinutes(formData, "resolutionHours");
  if (Number.isNaN(firstResponseMinutes) || Number.isNaN(resolutionMinutes)) {
    return { error: "Informe os prazos em horas (maior que zero)." };
  }

  const result = await setSlaPolicy({
    queueId: String(formData.get("queueId") ?? ""),
    priority: rawPriority as TicketPriority,
    firstResponseMinutes,
    resolutionMinutes,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
