import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/academy-seed";
import { files } from "../../../database/schema";
import { findAllMedia } from "../list-media/store";
import { updateMediaVisibility } from "./service";

async function seedFile(uploadedBy: string) {
  const [row] = await db
    .insert(files)
    .values({
      filename: "file.png",
      storageKey: `${crypto.randomUUID()}-file.png`,
      mimeType: "image/png",
      size: 10,
      url: "https://example.test/file.png",
      uploadedBy,
      visibility: "private",
    })
    .returning();
  return row;
}

describe("updateMediaVisibility — reflete na listagem de outro ator", () => {
  it("tornar um arquivo privado do dono em público faz ele aparecer na listagem de outro ator não-admin", async () => {
    const owner = await seedUser();
    const otherActor = await seedUser();
    const media = await seedFile(owner.id);

    const before = await findAllMedia({ actorId: otherActor.id, isMediaAdmin: false });
    expect(before.map((row) => row.id)).not.toContain(media.id);

    const result = await updateMediaVisibility({
      id: media.id,
      visibility: "public",
      actorId: owner.id,
      isMediaAdmin: false,
    });
    expect(result.success).toBe(true);

    const after = await findAllMedia({ actorId: otherActor.id, isMediaAdmin: false });
    expect(after.map((row) => row.id)).toContain(media.id);
  });

  it("um ator que não é dono nem media.manage não consegue alterar a visibilidade de outro arquivo", async () => {
    const owner = await seedUser();
    const intruder = await seedUser();
    const media = await seedFile(owner.id);

    const result = await updateMediaVisibility({
      id: media.id,
      visibility: "public",
      actorId: intruder.id,
      isMediaAdmin: false,
    });

    expect(result).toEqual({
      success: false,
      error: { code: "media.not_found", message: expect.any(String) },
    });
  });
});
