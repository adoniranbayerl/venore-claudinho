import type { EnrollmentGoalStatus } from "../contracts/types";

// Mapeamento único status -> texto/cor, consumido pelo badge pequeno da tabela admin e pelo
// indicador grande do slide de TV — as duas telas precisam concordar no rótulo e na cor, só o
// tamanho muda por contexto.
export const GOAL_STATUS_COPY: Record<EnrollmentGoalStatus, { label: string; className: string }> = {
  met: { label: "Meta atingida", className: "border-success-border bg-success-soft text-success" },
  "on-track": { label: "Em andamento", className: "border-warning-border bg-warning-soft text-warning" },
  below: { label: "Abaixo da meta", className: "bg-destructive/10 text-destructive" },
};
