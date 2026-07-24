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
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const { actor } = gate;
  const canManageContentTypes = actor.isSuperadmin || actor.permissions.includes("cms.content-types.manage");
  const canManageCategories = actor.isSuperadmin || actor.permissions.includes("cms.categories.manage");
  const canManageEntries = actor.isSuperadmin || actor.permissions.includes("cms.entries.manage");

  const [contentTypesResult, categoriesResult, entriesResult] = await Promise.all([
    listContentTypes(),
    listCategories(),
    canManageEntries ? listEntriesForAdmin() : Promise.resolve({ success: true as const, data: [] }),
  ]);

  if (!contentTypesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar content types: {contentTypesResult.error.message}</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar categorias: {categoriesResult.error.message}</p>;
  }
  if (!entriesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar entries: {entriesResult.error.message}</p>;
  }

  const contentTypes = contentTypesResult.data;
  const categories = categoriesResult.data;
  const entries = entriesResult.data;

  const contentTypeNameById = new Map(contentTypes.map((contentType) => [contentType.id, contentType.name]));
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">CMS</h1>
        <p className="mt-1 text-sm text-gray-600">Gerencie content types, categorias e entries.</p>
      </div>

      {canManageContentTypes && (
        <section className="rounded border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Content types</h2>
          <ul className="mt-3 space-y-1">
            {contentTypes.map((contentType) => (
              <li key={contentType.id} className="text-sm text-gray-700">
                {contentType.name} <span className="text-gray-500">({contentType.key})</span>
                {contentType.description && <span className="text-gray-500"> — {contentType.description}</span>}
              </li>
            ))}
            {contentTypes.length === 0 && <li className="text-sm text-gray-500">Nenhum content type cadastrado.</li>}
          </ul>
          <CreateContentTypeForm />
        </section>
      )}

      {canManageCategories && (
        <section className="rounded border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Categorias</h2>
          <ul className="mt-3 space-y-1">
            {categories.map((category) => (
              <li key={category.id} className="text-sm text-gray-700">
                {category.name} <span className="text-gray-500">({category.key}, /{category.slug})</span>
                {category.description && <span className="text-gray-500"> — {category.description}</span>}
              </li>
            ))}
            {categories.length === 0 && <li className="text-sm text-gray-500">Nenhuma categoria cadastrada.</li>}
          </ul>
          <CreateCategoryForm />
        </section>
      )}

      {canManageEntries && (
        <section className="rounded border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Entries</h2>
            <Link href="/admin/cms/entries/new" className="text-xs font-medium text-gray-900 hover:underline">
              Nova entry
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 text-sm text-gray-700">
                <div>
                  <Link href={`/admin/cms/entries/${entry.id}`} className="font-medium text-gray-900 hover:underline">
                    {entry.title}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {entry.slug} · {entry.status === "published" ? "publicada" : "rascunho"} ·{" "}
                    {contentTypeNameById.get(entry.contentTypeId) ?? entry.contentTypeId}
                    {entry.categoryId && <> · {categoryNameById.get(entry.categoryId) ?? entry.categoryId}</>}
                  </div>
                </div>
                {entry.status === "draft" && <PublishEntryButton entryId={entry.id} />}
              </li>
            ))}
            {entries.length === 0 && <li className="text-sm text-gray-500">Nenhuma entry cadastrada.</li>}
          </ul>
        </section>
      )}
    </div>
  );
}
