import { getSetting, registerDefaultSetting } from "@/contexts/settings";
import type { GetPresentationAccessResult } from "./types";

// Setting em vez de tabela própria — é um valor único, sem dono/ciclo de vida (não é um "output"
// por dispositivo como broadcast.outputs), então contexts/settings já resolve persistência sem
// precisar de schema/migration novos pro plugin.
const PRESENTATION_TOKEN_SETTING_KEY = "enrollment-dashboard.presentation-token";

function generateTokenCandidate(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function getPresentationAccess(): Promise<GetPresentationAccessResult> {
  const existing = await getSetting({ key: PRESENTATION_TOKEN_SETTING_KEY });
  if (existing.success && typeof existing.data?.value === "string" && existing.data.value.length > 0) {
    return { success: true, data: { token: existing.data.value } };
  }

  // Primeiro acesso: registra um candidato. insertSettingIfMissing (contexts/settings) é atômico
  // no banco (onConflictDoNothing) — se duas requisições chegarem juntas, só uma grava, e a
  // releitura abaixo pega o valor que de fato venceu, nunca o candidato descartado.
  await registerDefaultSetting({ key: PRESENTATION_TOKEN_SETTING_KEY, value: generateTokenCandidate() });
  const persisted = await getSetting({ key: PRESENTATION_TOKEN_SETTING_KEY });
  if (persisted.success && typeof persisted.data?.value === "string" && persisted.data.value.length > 0) {
    return { success: true, data: { token: persisted.data.value } };
  }

  return {
    success: false,
    error: { code: "enrollment-dashboard.presentation_token_unavailable", message: "Não foi possível gerar o link de apresentação." },
  };
}
