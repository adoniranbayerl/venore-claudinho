// Formato de saída (view model) do dashboard — mockado por enquanto (shared/mock-data.ts), mas
// desenhado pra ser o mesmo shape que um future service.ts real devolveria a partir de matrículas
// de contexts/academy ou de uma fonte externa (ver AGENTS.md seção 6 — próxima etapa é wire real).
export type EnrollmentProgramMetrics = {
  key: string;
  label: string;
  // Agrupamento visual opcional (ex: "Fundamental I", "Ensino Médio") — só faz sentido pra
  // instituição com muitos programas/turmas (colégio); a faculdade, com poucos cursos, não usa.
  group?: string;
  goal: number;
  renewed: number;
  newEnrollments: number;
};

export type EnrollmentInstitution = {
  key: string;
  name: string;
  logoMediaId: string;
  // Vocabulário do domínio ("Turma" no colégio, "Curso" na faculdade) — decidido pela instituição,
  // não inferido de programs.length (uma turma só de EM, por exemplo, ainda é "Turma").
  programLabel: string;
  programs: EnrollmentProgramMetrics[];
};

export type EnrollmentGoalStatus = "met" | "on-track" | "below";
