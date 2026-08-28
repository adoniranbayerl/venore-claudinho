import { listCategoriesForAdmin, listContentTypes } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { CreateEntryForm } from "./_components/create-entry-form";

export default async function NewEntryPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o conteúdo do site.</p>
      </div>
    );
  }

  const canManageEntries = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.entries.manage");
  if (!canManageEntries) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o conteúdo do site.</p>
      </div>
    );
  }

  const [contentTypesResult, categoriesResult] = await Promise.all([listContentTypes(), listCategoriesForAdmin()]);

  if (!contentTypesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as tags agora. Tente recarregar a página.</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as categorias agora. Tente recarregar a página.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Novo conteúdo</h1>
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <CreateEntryForm contentTypes={contentTypesResult.data} categories={categoriesResult.data} />
      </div>
    </div>
  );
}
