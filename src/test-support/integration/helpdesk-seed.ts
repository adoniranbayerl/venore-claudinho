// Helpers de seed para os testes de integração do plugin helpdesk (*.integration.test.ts). Fica
// fora de src/contexts/* e src/plugins/* de propósito, mesmo motivo de academy-seed.ts: precisa
// inserir direto em media.assets (não há API pública de insert cru de asset) e reusar o insert em
// auth.users. Filas/membros/categorias passam pelos service.ts reais.
import { randomUUID } from "node:crypto";
import { db } from "@/infrastructure/database/client";
import { assets } from "@/contexts/media/database/schema";
import { createQueue } from "@/plugins/helpdesk/features/queues/create-queue/service";
import { createCategory } from "@/plugins/helpdesk/features/categories/create-category/service";
import { setQueueMembers } from "@/plugins/helpdesk/features/queues/set-queue-members/service";
import { createKiosk } from "@/plugins/helpdesk/features/kiosks/create-kiosk/service";
import type { QueueMemberRole } from "@/plugins/helpdesk/contracts/types";
import type { OperationResult } from "@/shared/types";

export { seedUser } from "./academy-seed";

function unwrap<T>(result: OperationResult<T>): T {
  if (!result.success) {
    throw new Error(`Seed helper (helpdesk) falhou: ${result.error.code} — ${result.error.message}`);
  }
  return result.data;
}

export async function seedQueue(actorId: string, overrides: Partial<{ name: string }> = {}) {
  return unwrap(await createQueue({ name: overrides.name ?? `Fila ${randomUUID()}`, actorId }));
}

export async function seedCategory(queueId: string, actorId: string, overrides: Partial<{ label: string }> = {}) {
  return unwrap(await createCategory({ queueId, label: overrides.label ?? `Categoria ${randomUUID()}`, actorId }));
}

export async function seedQueueMembers(
  queueId: string,
  members: { userId: string; role: QueueMemberRole }[],
  actorId: string,
): Promise<void> {
  unwrap(await setQueueMembers({ queueId, members, canManageManagers: true, actorId }));
}

export async function seedKiosk(
  actorId: string,
  overrides: Partial<{ label: string; queueId: string | null; defaultLocation: string | null }> = {},
) {
  return unwrap(
    await createKiosk({
      label: overrides.label ?? `Quiosque ${randomUUID()}`,
      queueId: overrides.queueId ?? null,
      defaultLocation: overrides.defaultLocation ?? null,
      actorId,
    }),
  );
}

// Insere um asset de mídia mínimo direto na tabela (sem storage real) só pra o teste de
// integração poder exercitar a resolução de anexo em get-ticket / list-ticket-attachments.
export async function seedMediaAsset(uploadedBy: string, overrides: Partial<{ filename: string; contentType: string }> = {}) {
  const id = randomUUID();
  const [row] = await db
    .insert(assets)
    .values({
      id,
      filename: overrides.filename ?? "foto.jpg",
      pathname: `Imagens/${id}-foto.jpg`,
      url: `https://blob.test/${id}-foto.jpg`,
      contentType: overrides.contentType ?? "image/jpeg",
      size: 1024,
      checksum: randomUUID().replace(/-/g, ""),
      uploadedBy,
      visibility: "private",
    })
    .returning({ id: assets.id });
  return row.id;
}
