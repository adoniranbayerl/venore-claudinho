import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/academy-seed";
import { files, assets } from "./index";

// Prova que a migration de backfill (drizzle/0017_thick_joseph.sql) deixa toda linha existente
// com dono e visibilidade — não como comportamento de aplicação, mas como garantia de schema:
// `uploaded_by` já era NOT NULL antes deste fix, e `visibility` ganhou NOT NULL DEFAULT 'private'
// na mesma migration que adicionou a coluna, então o Postgres preenche automaticamente qualquer
// linha pré-existente (e bloqueia qualquer insert futuro que tente omitir as duas colunas).
describe("visibility — schema não permite asset sem dono e sem visibilidade", () => {
  it("um insert que só define as colunas obrigatórias herda visibility='private' do default da coluna", async () => {
    const actor = await seedUser();

    const [row] = await db
      .insert(files)
      .values({
        filename: "no-visibility-given.png",
        storageKey: `${crypto.randomUUID()}-no-visibility-given.png`,
        mimeType: "image/png",
        size: 10,
        url: "https://example.test/no-visibility-given.png",
        uploadedBy: actor.id,
      })
      .returning();

    expect(row.uploadedBy).toBe(actor.id);
    expect(row.visibility).toBe("private");
  });

  it("mesma garantia vale para a tabela assets (fluxo novo de upload)", async () => {
    const actor = await seedUser();

    const [row] = await db
      .insert(assets)
      .values({
        pathname: `${crypto.randomUUID()}-no-visibility-given.png`,
        url: "https://example.test/no-visibility-given.png",
        contentType: "image/png",
        size: 10,
        checksum: "checksum-1",
        uploadedBy: actor.id,
      })
      .returning();

    expect(row.uploadedBy).toBe(actor.id);
    expect(row.visibility).toBe("private");
  });
});
