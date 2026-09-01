import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUserWithSystemRole } from "@/test-support/integration/rbac-seed";
import { assets } from "@/contexts/media/database/schema";
import { createContentType } from "@/contexts/cms/features/content-types/create-content-type/service";
import { createEntry } from "@/contexts/cms/features/entries/create-entry/service";
import { updateEntry } from "@/contexts/cms/features/entries/update-entry/service";
import type { OperationResult } from "@/shared/types";
import { collectMediaUsage } from "@/platform/media-usage/media-usage-registry";

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

// Exercita a cadeia real (cms -> platform/media-usage), sem mock nenhum — é o caso descrito no
// pedido: "uso aparecendo após vínculo e sumindo após desvínculo".
// createEntry/updateEntry passam por assertCmsCategoryScope (RBAC Fase C) — daí o ator precisa do
// papel "admin" (permission global cms.entries.manage), não um seedUser sem papel.
describe("collectMediaUsage — vínculo e desvínculo com uma entry de CMS", () => {
  it("uma entry sem mídia vinculada não aparece no uso", async () => {
    const actor = await seedUserWithSystemRole("admin");
    const media = await seedMediaFile(actor.userId);

    const contentType = unwrap(
      await createContentType({ key: `usage-${randomUUID()}`, name: "Usage Test", actorId: actor.userId }),
    );
    unwrap(
      await createEntry({
        contentTypeIds: [contentType.id],
        title: "Sem mídia",
        slug: `sem-midia-${randomUUID()}`,
        actorId: actor.userId,
      }),
    );

    const usage = await collectMediaUsage(media.id);
    expect(usage).toEqual([]);
  });

  it("vincular a entry à mídia faz o uso aparecer, e desvincular faz sumir", async () => {
    const actor = await seedUserWithSystemRole("admin");
    const media = await seedMediaFile(actor.userId);

    const contentType = unwrap(
      await createContentType({ key: `usage-${randomUUID()}`, name: "Usage Test", actorId: actor.userId }),
    );
    const entry = unwrap(
      await createEntry({
        contentTypeIds: [contentType.id],
        title: "Com mídia",
        slug: `com-midia-${randomUUID()}`,
        mediaId: media.id,
        actorId: actor.userId,
      }),
    );

    const usageAfterLink = await collectMediaUsage(media.id);
    expect(usageAfterLink).toHaveLength(1);
    expect(usageAfterLink[0]).toMatchObject({ consumerKey: "cms", href: `/admin/cms/entries/${entry.id}` });

    unwrap(await updateEntry({ id: entry.id, mediaId: null, actorId: actor.userId }));

    const usageAfterUnlink = await collectMediaUsage(media.id);
    expect(usageAfterUnlink).toEqual([]);
  });
});
