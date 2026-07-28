import { listCategories, listContentTypes } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { CreateEntryForm } from "./_components/create-entry-form";

export default async function NewEntryPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const canManageEntries = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.entries.manage");
  if (!canManageEntries) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar entries do CMS.</p>
      </div>
    );
  }

  const [contentTypesResult, categoriesResult] = await Promise.all([listContentTypes(), listCategories()]);

  if (!contentTypesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar content types: {contentTypesResult.error.message}</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar categorias: {categoriesResult.error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Nova entry</h1>
      <div className="rounded border border-border bg-card p-4">
        <CreateEntryForm contentTypes={contentTypesResult.data} categories={categoriesResult.data} />
      </div>
    </div>
  );
}
