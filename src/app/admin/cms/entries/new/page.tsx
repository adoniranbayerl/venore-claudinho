import { listCategories, listContentTypes } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { CreateEntryForm } from "./_components/create-entry-form";

export default async function NewEntryPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const canManageEntries = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.entries.manage");
  if (!canManageEntries) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar entries do CMS.</p>
      </div>
    );
  }

  const [contentTypesResult, categoriesResult] = await Promise.all([listContentTypes(), listCategories()]);

  if (!contentTypesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar content types: {contentTypesResult.error.message}</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar categorias: {categoriesResult.error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Nova entry</h1>
      <div className="rounded border border-gray-200 bg-white p-4">
        <CreateEntryForm contentTypes={contentTypesResult.data} categories={categoriesResult.data} />
      </div>
    </div>
  );
}
