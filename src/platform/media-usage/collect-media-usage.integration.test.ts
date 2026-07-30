import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/academy-seed";
import { files } from "@/contexts/media/database/schema";
import { createContentType } from "@/contexts/cms/features/content-types/create-content-type/service";
import { createEntry } from "@/contexts/cms/features/entries/create-entry/service";
import { updateEntry } from "@/contexts/cms/features/entries/update-entry/service";
import type { OperationResult } from "@/shared/types";
import { collectMediaUsage } from "./media-usage-registry";

function unwrap<T>(result: OperationResult<T>): T {
  if (!result.success) {
    throw new Error(`Seed helper falhou: ${result.error.code} — ${result.error.message}`);
  }
  return result.data;
}

async function seedMediaFile(uploadedBy: string) {
  const [row] = await db
    .insert(files)
    .values({
      filename: "file.png",
      storageKey: `${randomUUID()}-file.png`,
      mimeType: "image/png",
      size: 10,
      url: "https://example.test/file.png",
      uploadedBy,
      visibility: "private",
    })
    .returning();
  return row;
}

// Exercita a cadeia real (cms -> platform/media-usage), sem mock nenhum — é o caso descrito no
// pedido: "uso aparecendo após vínculo e sumindo após desvínculo".
describe("collectMediaUsage — vínculo e desvínculo com uma entry de CMS", () => {
  it("uma entry sem mídia vinculada não aparece no uso", async () => {
    const actor = await seedUser();
    const media = await seedMediaFile(actor.id);

    const contentType = unwrap(
      await createContentType({ key: `usage-${randomUUID()}`, name: "Usage Test", actorId: actor.id }),
    );
    await createEntry({
      contentTypeId: contentType.id,
      title: "Sem mídia",
      slug: `sem-midia-${randomUUID()}`,
      actorId: actor.id,
    });

    const usage = await collectMediaUsage(media.id);
    expect(usage).toEqual([]);
  });

  it("vincular a entry à mídia faz o uso aparecer, e desvincular faz sumir", async () => {
    const actor = await seedUser();
    const media = await seedMediaFile(actor.id);

    const contentType = unwrap(
      await createContentType({ key: `usage-${randomUUID()}`, name: "Usage Test", actorId: actor.id }),
    );
    const entry = unwrap(
      await createEntry({
        contentTypeId: contentType.id,
        title: "Com mídia",
        slug: `com-midia-${randomUUID()}`,
        mediaId: media.id,
        actorId: actor.id,
      }),
    );

    const usageAfterLink = await collectMediaUsage(media.id);
    expect(usageAfterLink).toHaveLength(1);
    expect(usageAfterLink[0]).toMatchObject({ consumerKey: "cms", href: `/admin/cms/entries/${entry.id}` });

    await updateEntry({ id: entry.id, mediaId: null, actorId: actor.id });

    const usageAfterUnlink = await collectMediaUsage(media.id);
    expect(usageAfterUnlink).toEqual([]);
  });
});
