import Link from "next/link";
import { listCategories, listContentTypes, listEntriesForAdmin } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { CreateCategoryForm } from "./_components/create-category-form";
import { CreateContentTypeForm } from "./_components/create-content-type-form";
import { PublishEntryButton } from "./_components/publish-entry-button";

export default async function CmsAdminPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const { actor } = gate;
  const canManageContentTypes = actor.isSuperadmin || actor.permissions.includes("cms.content-types.manage");
  const canManageCategories = actor.isSuperadmin || actor.permissions.includes("cms.categories.manage");
  const canManageEntries = actor.isSuperadmin || actor.permissions.includes("cms.entries.manage");
  const canManageMenus = actor.isSuperadmin || actor.permissions.includes("cms.menus.manage");

  const [contentTypesResult, categoriesResult, entriesResult] = await Promise.all([
    listContentTypes(),
    listCategories(),
    canManageEntries ? listEntriesForAdmin() : Promise.resolve({ success: true as const, data: [] }),
  ]);

  if (!contentTypesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar content types: {contentTypesResult.error.message}</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar categorias: {categoriesResult.error.message}</p>;
  }
  if (!entriesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar entries: {entriesResult.error.message}</p>;
  }

  const contentTypes = contentTypesResult.data;
  const categories = categoriesResult.data;
  const entries = entriesResult.data;

  const contentTypeNameById = new Map(contentTypes.map((contentType) => [contentType.id, contentType.name]));
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">CMS</h1>
        <p className="mt-1 text-sm text-text-secondary">Gerencie content types, categorias e entries.</p>
      </div>

      {canManageContentTypes && (
        <section className="rounded border border-border-subtle bg-surface-panel p-4">
          <h2 className="text-sm font-semibold text-text-primary">Content types</h2>
          <ul className="mt-3 space-y-1">
            {contentTypes.map((contentType) => (
              <li key={contentType.id} className="text-sm text-text-secondary">
                {contentType.name} <span className="text-text-tertiary">({contentType.key})</span>
                {contentType.description && <span className="text-text-tertiary"> — {contentType.description}</span>}
              </li>
            ))}
            {contentTypes.length === 0 && <li className="text-sm text-text-tertiary">Nenhum content type cadastrado.</li>}
          </ul>
          <CreateContentTypeForm />
        </section>
      )}

      {canManageCategories && (
        <section className="rounded border border-border-subtle bg-surface-panel p-4">
          <h2 className="text-sm font-semibold text-text-primary">Categorias</h2>
          <ul className="mt-3 space-y-1">
            {categories.map((category) => (
              <li key={category.id} className="text-sm text-text-secondary">
                {category.name} <span className="text-text-tertiary">({category.key}, /{category.slug})</span>
                {category.description && <span className="text-text-tertiary"> — {category.description}</span>}
              </li>
            ))}
            {categories.length === 0 && <li className="text-sm text-text-tertiary">Nenhuma categoria cadastrada.</li>}
          </ul>
          <CreateCategoryForm />
        </section>
      )}

      {canManageEntries && (
        <section className="rounded border border-border-subtle bg-surface-panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Entries</h2>
            <Link href="/admin/cms/entries/new" className="text-xs font-medium text-text-primary hover:underline">
              Nova entry
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 text-sm text-text-secondary">
                <div>
                  <Link href={`/admin/cms/entries/${entry.id}`} className="font-medium text-text-primary hover:underline">
                    {entry.title}
                  </Link>
                  <div className="text-xs text-text-tertiary">
                    {entry.slug} · {entry.status === "published" ? "publicada" : "rascunho"} ·{" "}
                    {contentTypeNameById.get(entry.contentTypeId) ?? entry.contentTypeId}
                    {entry.categoryId && <> · {categoryNameById.get(entry.categoryId) ?? entry.categoryId}</>}
                  </div>
                </div>
                {entry.status === "draft" && <PublishEntryButton entryId={entry.id} />}
              </li>
            ))}
            {entries.length === 0 && <li className="text-sm text-text-tertiary">Nenhuma entry cadastrada.</li>}
          </ul>
        </section>
      )}

      {canManageMenus && (
        <section className="rounded border border-border-subtle bg-surface-panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Menus</h2>
            <Link href="/admin/cms/menus" className="text-xs font-medium text-text-primary hover:underline">
              Gerenciar main-nav
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
