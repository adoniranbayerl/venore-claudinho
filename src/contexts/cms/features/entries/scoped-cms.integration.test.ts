import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { categories } from "@/contexts/cms/database/schema";
import { getUserContext } from "@/contexts/rbac";
import { assertCmsCategoryScope } from "@/contexts/cms/shared/scoped-authorization";
import { createEntry } from "@/contexts/cms/features/entries/create-entry/service";
import { updateEntry } from "@/contexts/cms/features/entries/update-entry/service";
import { publishEntry } from "@/contexts/cms/features/entries/publish-entry/service";
import { listEntriesForAdmin } from "@/contexts/cms/features/entries/list-entries-for-admin/service";
import { seedUserWithSystemRole } from "@/test-support/integration/rbac-seed";
import type { OperationResult } from "@/shared/types";

function unwrap<T>(result: OperationResult<T>): T {
  if (!result.success) {
    throw new Error(`Seed/ação falhou: ${result.error.code} — ${result.error.message}`);
  }
  return result.data;
}

async function seedCategory(name: string): Promise<{ id: string }> {
  const [row] = await db
    .insert(categories)
    .values({ key: `k-${randomUUID()}`, slug: `s-${randomUUID()}`, name })
    .returning({ id: categories.id });
  return row;
}

async function seedEntry(actorId: string, categoryId: string | null, title: string) {
  return unwrap(
    await createEntry({ contentTypeIds: [], categoryId: categoryId ?? undefined, title, slug: `e-${randomUUID()}`, actorId }),
  );
}

describe("CMS × RBAC — escopo por categoria (Fase C)", () => {
  it("editor escopado à categoria A: escopo resolvido, lista e edita só A, não toca B", async () => {
    const catA = await seedCategory("Novidades");
    const catB = await seedCategory("Eventos");

    const admin = await seedUserWithSystemRole("admin");
    const editor = await seedUserWithSystemRole("editor", { categoryIds: [catA.id] });

    const entryA = await seedEntry(admin.userId, catA.id, "A1");
    const entryB = await seedEntry(admin.userId, catB.id, "B1");

    // getUserContext do editor traz o recorte por categoria vindo de role_assignment_scopes.
    const editorContext = unwrap(await getUserContext({ userId: editor.userId }));
    expect(editorContext.scopedPermissions["cms.entries.manage"]?.["cms.category"]).toEqual([catA.id]);
    // author/editor escopado não tem "global" em lugar nenhum dessa key
    expect(editorContext.scopedPermissions["cms.entries.publish"]?.["cms.category"]).toEqual([catA.id]);

    // assertCmsCategoryScope: dentro do escopo passa, fora nega, sem categoria nega.
    expect((await assertCmsCategoryScope(editor.userId, ["cms.entries.manage"], catA.id)).success).toBe(true);
    expect((await assertCmsCategoryScope(editor.userId, ["cms.entries.manage"], catB.id)).success).toBe(false);
    expect((await assertCmsCategoryScope(editor.userId, ["cms.entries.manage"], null)).success).toBe(false);

    // Listagem administrativa recortada pelos ids do escopo (o que o handler injeta).
    const scoped = editorContext.scopedPermissions["cms.entries.manage"]["cms.category"];
    const allowedCategoryIds = Array.isArray(scoped) ? scoped : undefined;
    const visible = unwrap(await listEntriesForAdmin({ allowedCategoryIds }));
    expect(visible.map((entry) => entry.id).sort()).toEqual([entryA.id].sort());

    // Editar: entry de A passa, entry de B é bloqueada, mover A→B é bloqueado.
    expect((await updateEntry({ id: entryA.id, title: "A1 editado", actorId: editor.userId })).success).toBe(true);

    const blockedEdit = await updateEntry({ id: entryB.id, title: "invasão", actorId: editor.userId });
    expect(blockedEdit.success).toBe(false);
    if (!blockedEdit.success) expect(blockedEdit.error.code).toBe("cms.entries.forbidden_scope");

    const blockedMove = await updateEntry({ id: entryA.id, categoryId: catB.id, actorId: editor.userId });
    expect(blockedMove.success).toBe(false);
    if (!blockedMove.success) expect(blockedMove.error.code).toBe("cms.entries.forbidden_scope");
  });

  it("author escopado à categoria A: cria e edita rascunho, mas não publica (D6)", async () => {
    const catA = await seedCategory("Blog");
    const author = await seedUserWithSystemRole("author", { categoryIds: [catA.id] });

    const draft = await seedEntry(author.userId, catA.id, "rascunho do autor");
    expect((await updateEntry({ id: draft.id, title: "rascunho editado", actorId: author.userId })).success).toBe(true);

    const published = await publishEntry({ id: draft.id, resolveDefinition: () => null, actorId: author.userId });
    expect(published.success).toBe(false);
    if (!published.success) {
      // author não tem cms.entries.publish de jeito nenhum → forbidden puro (não forbidden_scope).
      expect(published.error.code).toBe("rbac.authorization.forbidden");
    }
  });

  it("editor escopado publica dentro do escopo e falha fora dele", async () => {
    const catA = await seedCategory("Setor A");
    const catB = await seedCategory("Setor B");
    const admin = await seedUserWithSystemRole("admin");
    const editor = await seedUserWithSystemRole("editor", { categoryIds: [catA.id] });

    const inScope = await seedEntry(admin.userId, catA.id, "publicável");
    const outScope = await seedEntry(admin.userId, catB.id, "fora do setor");

    expect((await publishEntry({ id: inScope.id, resolveDefinition: () => null, actorId: editor.userId })).success).toBe(true);

    const denied = await publishEntry({ id: outScope.id, resolveDefinition: () => null, actorId: editor.userId });
    expect(denied.success).toBe(false);
    if (!denied.success) expect(denied.error.code).toBe("cms.entries.forbidden_scope");
  });

  it("admin global: escopo 'global', alcança qualquer categoria e vê tudo na listagem", async () => {
    const catA = await seedCategory("X");
    const catB = await seedCategory("Y");
    const admin = await seedUserWithSystemRole("admin");

    const context = unwrap(await getUserContext({ userId: admin.userId }));
    expect(context.scopedPermissions["cms.entries.manage"]?.["cms.category"]).toBe("global");

    await seedEntry(admin.userId, catA.id, "x1");
    await seedEntry(admin.userId, catB.id, "y1");
    await seedEntry(admin.userId, null, "sem categoria");

    expect((await assertCmsCategoryScope(admin.userId, ["cms.entries.manage"], catB.id)).success).toBe(true);
    expect((await assertCmsCategoryScope(admin.userId, ["cms.entries.publish"], null)).success).toBe(true);

    // Sem allowedCategoryIds → sem recorte: as 3 entries aparecem.
    const all = unwrap(await listEntriesForAdmin({}));
    expect(all.length).toBe(3);
  });
});
