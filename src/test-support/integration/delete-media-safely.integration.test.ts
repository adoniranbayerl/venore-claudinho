import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUserWithSystemRole } from "@/test-support/integration/rbac-seed";
import { assets } from "@/contexts/media/database/schema";
import { createContentType } from "@/contexts/cms/features/content-types/create-content-type/service";
import { createEntry } from "@/contexts/cms/features/entries/create-entry/service";
import type { OperationResult } from "@/shared/types";
import { deleteMediaSafely } from "@/platform/media-lifecycle/delete-media-safely";

function unwrap<T>(result: OperationResult<T>): T {
  if (!result.success) {
    throw new Error(`Seed helper falhou: ${result.error.code} — ${result.error.message}`);
  }
  return result.data;
}

async function seedMediaFile(uploadedBy: string) {
  const [row] = await db
    .insert(assets)
    .values({
      filename: "file.png",
      pathname: `${randomUUID()}-file.png`,
      contentType: "image/png",
      size: 10,
      checksum: `checksum-${randomUUID()}`,
      url: "https://example.test/file.png",
      uploadedBy,
      visibility: "public",
    })
    .returning();
  return row;
}

// deleteMediaSafely é o ponto de composição (platform/media-lifecycle): ele checa uso em
// cms/brand/academy via collectMediaUsage e, sem `confirmed`, RECUSA apagar mídia em uso. A
// exclusão em si delega pro handler de media (authorizeActor("media.manage")) — sem sessão nos
// testes de integração —, então essa parte é coberta pelo unitário
// delete-media-asset/service.test.ts, não aqui. Este arquivo cobre só o portão de
// aviso+confirmação, exercitando a cadeia real cms -> media-usage.
// createEntry passa por assertCmsCategoryScope (RBAC Fase C): o ator precisa do papel "admin".
describe("deleteMediaSafely — portão de aviso + confirmação", () => {
  it("recusa apagar (confirmation_required) e diz em quantos locais o arquivo está em uso", async () => {
    const actor = await seedUserWithSystemRole("admin");
    const media = await seedMediaFile(actor.userId);
    const contentType = unwrap(
      await createContentType({ key: `delete-safely-${randomUUID()}`, name: "Delete Safely Test", actorId: actor.userId }),
    );
    unwrap(
      await createEntry({
        contentTypeIds: [contentType.id],
        title: "Usa a mídia",
        slug: `usa-a-midia-${randomUUID()}`,
        mediaId: media.id,
        actorId: actor.userId,
      }),
    );

    const result = await deleteMediaSafely({ id: media.id });

    expect(result).toEqual({
      success: false,
      error: { code: "media.delete.confirmation_required", message: expect.stringContaining("1 local") },
    });
  });

  it("uma mídia sem uso não dispara o portão de confirmação", async () => {
    const actor = await seedUserWithSystemRole("admin");
    const media = await seedMediaFile(actor.userId);

    const result = await deleteMediaSafely({ id: media.id });

    // Não é `confirmation_required` — segue direto pro handler de media (que, sem sessão de
    // teste, responde `unauthenticated`; o soft-delete real é coberto no unitário do service).
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).not.toBe("media.delete.confirmation_required");
  });
});
