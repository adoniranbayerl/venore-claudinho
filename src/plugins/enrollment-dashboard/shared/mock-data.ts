import type { EnrollmentInstitution } from "../contracts/types";

// IDs reais de media.assets (biblioteca de mídia já tem os logos enviados) — "logoMediaId" é
// resolvido pra URL/blob via getMediaAsset (contexts/media) na página, nunca hardcoded aqui.
const ERASTO_GAERTNER_LOGO_MEDIA_ID = "2078515e-4c28-45cd-adf9-d92ed5bd5c34";
const FIDELIS_LOGO_MEDIA_ID = "9da8e513-7cda-424a-b17b-1ffbddfeef92";

// Colégio vai do Nível II (Educação Infantil) ao 3º ano do Ensino Médio — sem Nível I/Berçário
// (pedido explícito). Ordem é a grade curricular real, não alfabética — os slides/tabelas que
// agrupam por "group" dependem dessa ordem de declaração.
const ERASTO_GAERTNER_TURMAS = [
  { key: "ni2", label: "Nível II", group: "Educação Infantil", goal: 24, renewed: 14, newEnrollments: 8 },
  { key: "ni3", label: "Nível III", group: "Educação Infantil", goal: 26, renewed: 16, newEnrollments: 9 },
  { key: "ni4", label: "Nível IV", group: "Educação Infantil", goal: 28, renewed: 18, newEnrollments: 8 },
  { key: "ni5", label: "Nível V", group: "Educação Infantil", goal: 28, renewed: 19, newEnrollments: 7 },
  { key: "f1-1", label: "1º ano", group: "Fundamental I", goal: 30, renewed: 18, newEnrollments: 10 },
  { key: "f1-2", label: "2º ano", group: "Fundamental I", goal: 30, renewed: 20, newEnrollments: 8 },
  { key: "f1-3", label: "3º ano", group: "Fundamental I", goal: 32, renewed: 22, newEnrollments: 9 },
  { key: "f1-4", label: "4º ano", group: "Fundamental I", goal: 32, renewed: 24, newEnrollments: 6 },
  { key: "f1-5", label: "5º ano", group: "Fundamental I", goal: 34, renewed: 26, newEnrollments: 7 },
  { key: "f2-6", label: "6º ano", group: "Fundamental II", goal: 36, renewed: 28, newEnrollments: 6 },
  { key: "f2-7", label: "7º ano", group: "Fundamental II", goal: 36, renewed: 27, newEnrollments: 5 },
  { key: "f2-8", label: "8º ano", group: "Fundamental II", goal: 34, renewed: 25, newEnrollments: 4 },
  { key: "f2-9", label: "9º ano", group: "Fundamental II", goal: 34, renewed: 24, newEnrollments: 3 },
  { key: "em-1", label: "1º EM", group: "Ensino Médio", goal: 38, renewed: 22, newEnrollments: 8 },
  { key: "em-2", label: "2º EM", group: "Ensino Médio", goal: 36, renewed: 24, newEnrollments: 5 },
  { key: "em-3", label: "3º EM", group: "Ensino Médio", goal: 34, renewed: 20, newEnrollments: 3 },
];

// Dado mockado (AGENTS.md seção 6 — próxima etapa: trocar por service.ts real lendo matrícula de
// verdade). Formato já é o EnrollmentInstitution final pra essa troca não mexer em página/
// componentes, só na origem do dado.
export function getMockEnrollmentDashboardData(): EnrollmentInstitution[] {
  return [
    {
      key: "erasto-gaertner",
      name: "Colégio Erasto Gaertner",
      logoMediaId: ERASTO_GAERTNER_LOGO_MEDIA_ID,
      programLabel: "Turma",
      programs: ERASTO_GAERTNER_TURMAS,
    },
    {
      key: "fidelis",
      name: "Faculdade Fidelis",
      logoMediaId: FIDELIS_LOGO_MEDIA_ID,
      programLabel: "Curso",
      programs: [
        { key: "psicologia", label: "Psicologia", goal: 180, renewed: 96, newEnrollments: 71 },
        { key: "pedagogia", label: "Pedagogia", goal: 140, renewed: 88, newEnrollments: 40 },
        { key: "teologia", label: "Teologia", goal: 90, renewed: 52, newEnrollments: 22 },
        { key: "teologia-ead", label: "Teologia EAD", goal: 220, renewed: 134, newEnrollments: 102 },
      ],
    },
  ];
}
