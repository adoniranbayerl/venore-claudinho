import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/academy-seed";
import { files } from "../../../database/schema";
import type { MediaVisibility } from "../../../contracts/types";
import { findMediaById } from "./store";

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

describe("findMediaById — acesso por id não vaza existência", () => {
  it("ator B busca por id o asset privado do ator A e recebe null (não encontrado)", async () => {
    const actorA = await seedUser();
    const actorB = await seedUser();
    const privateA = await seedFile(actorA.id, "private");

    const result = await findMediaById(privateA.id, { actorId: actorB.id, isMediaAdmin: false });

    expect(result).toBeNull();
  });

  it("ator B busca por id um asset público do ator A e recebe o registro", async () => {
    const actorA = await seedUser();
    const actorB = await seedUser();
    const publicA = await seedFile(actorA.id, "public");

    const result = await findMediaById(publicA.id, { actorId: actorB.id, isMediaAdmin: false });

    expect(result?.id).toBe(publicA.id);
  });

  it("o dono busca por id o próprio asset privado e recebe o registro", async () => {
    const actorA = await seedUser();
    const privateA = await seedFile(actorA.id, "private");

    const result = await findMediaById(privateA.id, { actorId: actorA.id, isMediaAdmin: false });

    expect(result?.id).toBe(privateA.id);
  });

  it("um administrador de mídia busca por id o asset privado de outro ator e recebe o registro", async () => {
    const actorA = await seedUser();
    const admin = await seedUser();
    const privateA = await seedFile(actorA.id, "private");

    const result = await findMediaById(privateA.id, { actorId: admin.id, isMediaAdmin: true });

    expect(result?.id).toBe(privateA.id);
  });
});
