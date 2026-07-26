import { notFound } from "next/navigation";
import { getEntry, getEntryBody, listCategories } from "@/contexts/cms";
import { getMedia } from "@/contexts/media";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { EditEntryForm } from "./_components/edit-entry-form";
import { PublishButton } from "./_components/publish-button";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const canManageEntries = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.entries.manage");
  if (!canManageEntries) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar entries do CMS.</p>
      </div>
    );
  }

  const [entryResult, categoriesResult] = await Promise.all([getEntry({ id }), listCategories()]);

  if (!entryResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar entry: {entryResult.error.message}</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar categorias: {categoriesResult.error.message}</p>;
  }

  const entry = entryResult.data;
  if (!entry) {
    notFound();
  }

  const mediaResult = entry.mediaId ? await getMedia({ id: entry.mediaId }) : null;
  const media = mediaResult?.success && mediaResult.data ? mediaResult.data : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Editar entry</h1>
        <span className="text-sm text-text-tertiary">{entry.status === "published" ? "publicada" : "rascunho"}</span>
      </div>

      <div className="rounded border border-border-subtle bg-surface-panel p-4">
        <EditEntryForm
          entryId={entry.id}
          title={entry.title}
          slug={entry.slug}
          body={getEntryBody(entry.data)}
          categoryId={entry.categoryId}
          media={media}
          categories={categoriesResult.data}
        />
      </div>

      {entry.status === "draft" && (
        <div className="rounded border border-border-subtle bg-surface-panel p-4">
          <PublishButton entryId={entry.id} />
        </div>
      )}
    </div>
  );
}
