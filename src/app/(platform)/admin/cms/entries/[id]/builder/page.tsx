import { notFound } from "next/navigation";
import { getCachedEntry, getEntryComposition } from "@/contexts/cms";
import { listBlockDefinitions } from "@/platform/page-builder/block-registry";
import { getActivePluginKeys } from "@/platform/plugin-engine/get-active-plugin-keys";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { BlockRenderer } from "@/components/page-builder/block-renderer";
import { CompositionBuilder } from "./_components/composition-builder";

export default async function EntryBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const canManageEntries = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.entries.manage");
  if (!canManageEntries) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar entries do CMS.</p>
      </div>
    );
  }

  const [entryResult, compositionResult, activePluginKeys] = await Promise.all([
    getCachedEntry(id),
    getEntryComposition({ id }),
    getActivePluginKeys(),
  ]);

  if (!entryResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar entry: {entryResult.error.message}</p>;
  }
  const entry = entryResult.data;
  if (!entry) {
    notFound();
  }
  if (!compositionResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar composição: {compositionResult.error.message}</p>;
  }

  const composition = compositionResult.data ?? [];

  return (
    <CompositionBuilder
      entryId={entry.id}
      entryTitle={entry.title}
      entrySlug={entry.slug}
      initialComposition={composition}
      definitions={listBlockDefinitions(activePluginKeys)}
      preview={<BlockRenderer blocks={composition} mode="edit" />}
    />
  );
}
