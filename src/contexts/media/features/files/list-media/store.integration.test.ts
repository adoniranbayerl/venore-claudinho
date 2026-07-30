import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/academy-seed";
import { files } from "../../../database/schema";
import type { MediaVisibility } from "../../../contracts/types";
import { findAllMedia } from "./store";

async function seedFile(uploadedBy: string, visibility: MediaVisibility, filename = "file.png") {
  const [row] = await db
    .insert(files)
    .values({
      filename,
      storageKey: `${crypto.randomUUID()}-${filename}`,
      mimeType: "image/png",
      size: 10,
      url: "https://example.test/file.png",
      uploadedBy,
      visibility,
    })
    .returning();
  return row;
}

describe("findAllMedia — filtro de visibilidade", () => {
  it("ator B não vê mídia privada do ator A, mas vê mídia pública dele e a sua própria (privada ou não)", async () => {
    const actorA = await seedUser();
    const actorB = await seedUser();

    const privateA = await seedFile(actorA.id, "private");
    const publicA = await seedFile(actorA.id, "public");
    const privateB = await seedFile(actorB.id, "private");

    const result = await findAllMedia({ actorId: actorB.id, isMediaAdmin: false });
    const ids = result.map((row) => row.id);

    expect(ids).not.toContain(privateA.id);
    expect(ids).toContain(publicA.id);
    expect(ids).toContain(privateB.id);
  });

  it("um administrador de mídia enxerga tudo, inclusive privado de outros atores", async () => {
    const actorA = await seedUser();
    const admin = await seedUser();

    const privateA = await seedFile(actorA.id, "private");
    const publicA = await seedFile(actorA.id, "public");

    const result = await findAllMedia({ actorId: admin.id, isMediaAdmin: true });
    const ids = result.map((row) => row.id);

    expect(ids).toContain(privateA.id);
    expect(ids).toContain(publicA.id);
  });
});
