import { listContentTypes } from "@/contexts/cms";
import { getCmsContentTypesPageData } from "@/platform/admin-shell/get-cms-content-types-page-data";
import { EmptyState } from "@/components/empty-state";
import { CreateContentTypeForm } from "../_components/create-content-type-form";
import { ContentTypesTable } from "../_components/content-types-table";
import { LayoutList } from "lucide-react";

export default async function CmsContentTypesAdminPage() {
  const gate = await getCmsContentTypesPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar tags.</p>
      </div>
    );
  }

  const contentTypesResult = await listContentTypes();

  if (!contentTypesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as tags agora. Tente recarregar a página.</p>;
  }

  const contentTypes = contentTypesResult.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Um conteúdo pode ter mais de uma — por exemplo, &ldquo;Notícia&rdquo; e &ldquo;Destaque&rdquo; ao mesmo tempo.
          </p>
        </div>
        {contentTypes.length > 0 && <CreateContentTypeForm />}
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        {contentTypes.length === 0 ? (
          <EmptyState
            icon={<LayoutList className="size-8" strokeWidth={1.5} />}
            title="Nenhuma tag ainda"
            description="Crie a primeira (ex: Notícia, Página) para começar a cadastrar conteúdo."
            action={<CreateContentTypeForm />}
          />
        ) : (
          <ContentTypesTable contentTypes={contentTypes} />
        )}
      </section>
    </div>
  );
}
