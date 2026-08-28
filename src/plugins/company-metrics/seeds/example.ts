import type { OperationResult } from "@/shared/types";
import { listSectors } from "../features/sectors/list-sectors/service";
import { createSector } from "../features/sectors/create-sector/service";

// Dados de exemplo do plugin. Idempotente: pula setor já existente pelo nome. Chama service.ts
// direto — sem sessão/ator neste caminho; SEED_ACTOR_ID é só rótulo de auditoria.
// Fases seguintes estendem esta função (métricas/metas/telas de exemplo por setor).
const SEED_ACTOR_ID = "system-seed";

const SEED_SECTORS: { name: string; description: string; icon: string }[] = [
  { name: "Comercial", description: "Captação, funil e conversão de matrículas.", icon: "trending-up" },
  { name: "Financeiro", description: "Receita, inadimplência e fluxo de caixa.", icon: "wallet" },
  { name: "Marketing", description: "Alcance, geração de leads e campanhas.", icon: "megaphone" },
];

export async function seedCompanyMetricsExample(): Promise<OperationResult<void>> {
  const existing = await listSectors({ includeArchived: true });
  if (!existing.success) {
    return { success: false, error: existing.error };
  }
  const existingNames = new Set(existing.data.map((sector) => sector.name.toLowerCase()));

  for (const seed of SEED_SECTORS) {
    if (existingNames.has(seed.name.toLowerCase())) continue;
    const result = await createSector({
      name: seed.name,
      description: seed.description,
      icon: seed.icon,
      actorId: SEED_ACTOR_ID,
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
  }

  return { success: true, data: undefined };
}
