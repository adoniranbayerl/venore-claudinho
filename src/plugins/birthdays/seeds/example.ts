import type { OperationResult } from "@/shared/types";
import { createBirthday } from "../features/create-birthday/service";
import { listBirthdays } from "../features/list-birthdays/service";

// Seed de dados de exemplo do plugin (platform/plugin-engine/plugin-seed-registry.ts) — rodado
// via /admin/plugins, na instalação ou pelo botão "Popular dados de exemplo". Chama service.ts
// direto (não o handler via barrel): não existe sessão/ator autenticado neste caminho — mesmo
// racional de scripts/seed-enrollment-dashboard.ts e grant-superadmin/handler.ts. actorId aqui é
// só rótulo de auditoria de beginOperation.
const SEED_ACTOR_ID = "system-seed";

const EXAMPLE_BIRTHDAYS = [
  { fullName: "Ana Beatriz Lima", role: "Coordenação Pedagógica", locality: "Matriz", month: 1, day: 12 },
  { fullName: "Carlos Eduardo Ramos", role: "Secretaria", locality: "Matriz", month: 3, day: 4 },
  { fullName: "Daniela Figueiredo", role: "Biblioteca", locality: "Matriz", month: 5, day: 22 },
  { fullName: "Eduardo Nunes", role: "TI", locality: "Matriz", month: 7, day: 9 },
  { fullName: "Fernanda Souza", role: "Financeiro", locality: "Matriz", month: 9, day: 17 },
  { fullName: "Gustavo Pereira", role: "Manutenção", locality: "Matriz", month: 11, day: 30 },
];

// Idempotente: pula quem já existe pelo nome completo — rodar 2x não duplica.
export async function seedBirthdaysExample(): Promise<OperationResult<void>> {
  const existing = await listBirthdays();
  if (!existing.success) {
    return { success: false, error: existing.error };
  }
  const existingNames = new Set(existing.data.map((birthday) => birthday.fullName));

  for (const entry of EXAMPLE_BIRTHDAYS) {
    if (existingNames.has(entry.fullName)) continue;
    const created = await createBirthday({ ...entry, actorId: SEED_ACTOR_ID });
    if (!created.success) {
      return { success: false, error: created.error };
    }
  }

  return { success: true, data: undefined };
}
