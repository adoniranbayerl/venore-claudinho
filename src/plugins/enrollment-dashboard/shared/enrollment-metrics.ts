import type { EnrollmentGoalStatus, EnrollmentProgramMetrics } from "../contracts/types";

// Total nunca é armazenado no dado (mock ou futuro real) — sempre derivado de
// renewed + newEnrollments, pra não existir um jeito de ficar inconsistente com as duas parcelas.
export function totalEnrollments(program: Pick<EnrollmentProgramMetrics, "renewed" | "newEnrollments">): number {
  return program.renewed + program.newEnrollments;
}

export function goalCompletionRatio(program: Pick<EnrollmentProgramMetrics, "goal" | "renewed" | "newEnrollments">): number {
  if (program.goal <= 0) {
    return 0;
  }
  return totalEnrollments(program) / program.goal;
}

// Faixas: >=100% meta batida, >=85% em andamento (ritmo aceitável), abaixo disso precisa de
// atenção. Sem persistência/configuração ainda — limiar fixo, revisar quando o dado for real.
export function goalStatus(program: Pick<EnrollmentProgramMetrics, "goal" | "renewed" | "newEnrollments">): EnrollmentGoalStatus {
  const ratio = goalCompletionRatio(program);
  if (ratio >= 1) {
    return "met";
  }
  if (ratio >= 0.85) {
    return "on-track";
  }
  return "below";
}

// Soma de todos os programas de uma instituição — usado tanto pelo card detalhado do admin quanto
// pelos painéis do slide de TV, pra não duplicar o reduce em cada lugar que precisa do agregado.
export function sumProgramTotals(programs: Pick<EnrollmentProgramMetrics, "goal" | "renewed" | "newEnrollments">[]) {
  return programs.reduce(
    (acc, program) => ({
      goal: acc.goal + program.goal,
      renewed: acc.renewed + program.renewed,
      newEnrollments: acc.newEnrollments + program.newEnrollments,
    }),
    { goal: 0, renewed: 0, newEnrollments: 0 },
  );
}

// % de retenção = rematriculados ÷ total matriculado — mede quanto da matrícula atual já estava
// na instituição, não quanto falta pra meta (goalCompletionRatio, uma conta diferente). Aceita
// tanto um programa quanto um agregado de sumProgramTotals, mesmo shape nos dois casos.
export function retentionRatio(totals: Pick<EnrollmentProgramMetrics, "renewed" | "newEnrollments">): number {
  const total = totalEnrollments(totals);
  if (total <= 0) {
    return 0;
  }
  return totals.renewed / total;
}

// Larguras (0-100) dos dois segmentos da barra de composição — o "track" inteiro representa a
// meta; o preenchido representa o total matriculado, dividido em rematrícula/nova. Denominador é
// max(meta, total) pra nunca passar de 100% mesmo quando o total já superou a meta (ver Teologia
// EAD no mock: 236 matriculados numa meta de 220) — nesse caso a barra fica cheia, sem sobrar
// "track" vazio, e a proporção interna passa a refletir a composição do total, não mais da meta.
export function compositionBarWidths(
  program: Pick<EnrollmentProgramMetrics, "goal" | "renewed" | "newEnrollments">,
): { renewedPercent: number; newPercent: number } {
  const denom = Math.max(program.goal, totalEnrollments(program));
  if (denom <= 0) {
    return { renewedPercent: 0, newPercent: 0 };
  }
  return {
    renewedPercent: (program.renewed / denom) * 100,
    newPercent: (program.newEnrollments / denom) * 100,
  };
}
