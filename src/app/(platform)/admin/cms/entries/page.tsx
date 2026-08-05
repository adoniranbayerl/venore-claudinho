import Link from "next/link";
import { FileText } from "lucide-react";
import { listCategories, listContentTypes, listEntriesForAdmin } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { EmptyState } from "@/components/empty-state";
import { EntriesTable } from "../_components/entries-table";

export default async function CmsEntriesAdminPage() {
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
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar conteúdos.</p>
      </div>
    );
  }

  const [contentTypesResult, categoriesResult, entriesResult] = await Promise.all([
    listContentTypes(),
    listCategories(),
    listEntriesForAdmin(),
  ]);

  if (!contentTypesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as tags agora. Tente recarregar a página.</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as categorias agora. Tente recarregar a página.</p>;
  }
  if (!entriesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os conteúdos agora. Tente recarregar a página.</p>;
  }

  const contentTypes = contentTypesResult.data;
  const categories = categoriesResult.data;
  const entries = entriesResult.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Conteúdos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Todos os conteúdos do site, em qualquer status.</p>
        </div>
        {entries.length > 0 && (
          <Link
            href="/admin/cms/entries/new"
            className="ui-button-base ui-button-sm bg-primary text-primary-foreground outline-none ui-motion-base hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Novo conteúdo
          </Link>
        )}
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        {entries.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8" strokeWidth={1.5} />}
            title="Nenhum conteúdo ainda"
            description="Os conteúdos que você criar aqui aparecem nesta lista, em qualquer status."
            action={
              <Link
                href="/admin/cms/entries/new"
                className="ui-button-base ui-button-sm bg-primary text-primary-foreground outline-none ui-motion-base hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Novo conteúdo
              </Link>
            }
          />
        ) : (
          <EntriesTable entries={entries} contentTypes={contentTypes} categories={categories} />
        )}
      </section>
    </div>
  );
}
