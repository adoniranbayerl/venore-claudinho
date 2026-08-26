// Conteúdo inicial pro seed (scripts/seed-enrollment-dashboard.ts) — não é mais o dado servido ao
// dashboard (isso agora vem de features/get-enrollment-dashboard-data, lendo institutions/programs
// reais). Sem "key"/"id" de propósito: quem insere (create-institution/create-program) gera a key
// a partir do nome/label — ver comentário em features/institutions/create-institution/service.ts.
export type SeedProgram = {
  label: string;
  group?: string;
  goal: number;
  renewed: number;
  newEnrollments: number;
};

export type SeedInstitution = {
  name: string;
  logoMediaId: string;
  programLabel: string;
  programs: SeedProgram[];
};

// IDs reais de media.assets (biblioteca de mídia já tem os logos enviados).
const ERASTO_GAERTNER_LOGO_MEDIA_ID = "2078515e-4c28-45cd-adf9-d92ed5bd5c34";
const FIDELIS_LOGO_MEDIA_ID = "9da8e513-7cda-424a-b17b-1ffbddfeef92";

// Colégio vai do Nível II (Educação Infantil) ao 3º ano do Ensino Médio — sem Nível I/Berçário
// (pedido explícito). Ordem é a grade curricular real, não alfabética.
const ERASTO_GAERTNER_TURMAS: SeedProgram[] = [
  { label: "Nível II", group: "Educação Infantil", goal: 24, renewed: 14, newEnrollments: 8 },
  { label: "Nível III", group: "Educação Infantil", goal: 26, renewed: 16, newEnrollments: 9 },
  { label: "Nível IV", group: "Educação Infantil", goal: 28, renewed: 18, newEnrollments: 8 },
  { label: "Nível V", group: "Educação Infantil", goal: 28, renewed: 19, newEnrollments: 7 },
  { label: "1º ano", group: "Fundamental I", goal: 30, renewed: 18, newEnrollments: 10 },
  { label: "2º ano", group: "Fundamental I", goal: 30, renewed: 20, newEnrollments: 8 },
  { label: "3º ano", group: "Fundamental I", goal: 32, renewed: 22, newEnrollments: 9 },
  { label: "4º ano", group: "Fundamental I", goal: 32, renewed: 24, newEnrollments: 6 },
  { label: "5º ano", group: "Fundamental I", goal: 34, renewed: 27, newEnrollments: 8 },
  { label: "6º ano", group: "Fundamental II", goal: 36, renewed: 28, newEnrollments: 6 },
  { label: "7º ano", group: "Fundamental II", goal: 36, renewed: 27, newEnrollments: 5 },
  { label: "8º ano", group: "Fundamental II", goal: 34, renewed: 25, newEnrollments: 4 },
  { label: "9º ano", group: "Fundamental II", goal: 34, renewed: 24, newEnrollments: 3 },
  { label: "1º EM", group: "Ensino Médio", goal: 38, renewed: 22, newEnrollments: 8 },
  { label: "2º EM", group: "Ensino Médio", goal: 36, renewed: 24, newEnrollments: 5 },
  { label: "3º EM", group: "Ensino Médio", goal: 34, renewed: 20, newEnrollments: 3 },
];

export function getSeedEnrollmentDashboardData(): SeedInstitution[] {
  return [
    {
      name: "Colégio Erasto Gaertner",
      logoMediaId: ERASTO_GAERTNER_LOGO_MEDIA_ID,
      programLabel: "Turma",
      programs: ERASTO_GAERTNER_TURMAS,
    },
    {
      name: "Faculdade Fidelis",
      logoMediaId: FIDELIS_LOGO_MEDIA_ID,
      programLabel: "Curso",
      programs: [
        { label: "Psicologia", goal: 180, renewed: 96, newEnrollments: 71 },
        { label: "Pedagogia", goal: 140, renewed: 88, newEnrollments: 40 },
        { label: "Teologia", goal: 90, renewed: 52, newEnrollments: 22 },
        { label: "Teologia EAD", goal: 220, renewed: 134, newEnrollments: 102 },
      ],
    },
  ];
}
