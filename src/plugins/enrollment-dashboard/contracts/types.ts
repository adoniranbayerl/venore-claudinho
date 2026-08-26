// Formato de saída (view model) do dashboard — hoje vem de banco real (features/
// get-enrollment-dashboard-data), mesmo shape que os slides de apresentação e a view do admin
// sempre esperaram (ver shared/mock-data.ts, usado só como fonte do seed inicial agora).
export type EnrollmentProgramMetrics = {
  id: string;
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
  id: string;
  key: string;
  name: string;
  logoMediaId: string | null;
  // Vocabulário do domínio ("Turma" no colégio, "Curso" na faculdade) — decidido pela instituição,
  // não inferido de programs.length (uma turma só de EM, por exemplo, ainda é "Turma").
  programLabel: string;
  programs: EnrollmentProgramMetrics[];
};

export type EnrollmentGoalStatus = "met" | "on-track" | "below";

// Shape bruto das tabelas (database/schema/index.ts) — só os features de institutions/programs
// leem/escrevem isso; o resto do plugin (dashboard, slides) só conhece EnrollmentInstitution/
// EnrollmentProgramMetrics acima.
export type InstitutionRecord = {
  id: string;
  key: string;
  name: string;
  logoMediaId: string | null;
  programLabel: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramRecord = {
  id: string;
  institutionId: string;
  key: string;
  label: string;
  groupLabel: string | null;
  goal: number;
  renewed: number;
  newEnrollments: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
