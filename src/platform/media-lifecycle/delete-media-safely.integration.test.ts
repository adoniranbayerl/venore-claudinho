import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/academy-seed";
import { files } from "@/contexts/media/database/schema";
import { getMedia } from "@/contexts/media";
import { createContentType } from "@/contexts/cms/features/content-types/create-content-type/service";
import { createEntry } from "@/contexts/cms/features/entries/create-entry/service";
import type { OperationResult } from "@/shared/types";
import { deleteMediaSafely } from "./delete-media-safely";

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

describe("deleteMediaSafely — asset em uso", () => {
  it("avisa quantos locais usam o arquivo e não apaga sem confirmação", async () => {
    const actor = await seedUser();
    const media = await seedMediaFile(actor.id);
    const contentType = unwrap(
      await createContentType({ key: `delete-safely-${randomUUID()}`, name: "Delete Safely Test", actorId: actor.id }),
    );
    await createEntry({
      contentTypeId: contentType.id,
      title: "Usa a mídia",
      slug: `usa-a-midia-${randomUUID()}`,
      mediaId: media.id,
      actorId: actor.id,
    });

    const result = await deleteMediaSafely({ id: media.id });

    expect(result).toEqual({
      success: false,
      error: { code: "media.delete.confirmation_required", message: expect.stringContaining("1 local") },
    });

    const stillThere = await getMedia({ id: media.id });
    expect(stillThere.success && stillThere.data !== null).toBe(true);
  });

  it("apaga o arquivo em uso quando o chamador confirma", async () => {
    const actor = await seedUser();
    const media = await seedMediaFile(actor.id);
    const contentType = unwrap(
      await createContentType({ key: `delete-safely-${randomUUID()}`, name: "Delete Safely Test", actorId: actor.id }),
    );
    await createEntry({
      contentTypeId: contentType.id,
      title: "Usa a mídia",
      slug: `usa-a-midia-${randomUUID()}`,
      mediaId: media.id,
      actorId: actor.id,
    });

    const result = await deleteMediaSafely({ id: media.id, confirmed: true });
    expect(result.success).toBe(true);
  });

  it("apaga direto quando o arquivo não está em uso, mesmo sem confirmação", async () => {
    const actor = await seedUser();
    const media = await seedMediaFile(actor.id);

    const result = await deleteMediaSafely({ id: media.id });
    expect(result.success).toBe(true);
  });
});
