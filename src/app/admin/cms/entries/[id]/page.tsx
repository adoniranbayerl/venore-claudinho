import { notFound } from "next/navigation";
import { getEntry, listCategories } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { EditEntryForm } from "./_components/edit-entry-form";
import { PublishButton } from "./_components/publish-button";

function extractBody(data: unknown): string {
  if (data && typeof data === "object" && "body" in data && typeof (data as { body: unknown }).body === "string") {
    return (data as { body: string }).body;
  }
  return "";
}

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const [entryResult, categoriesResult] = await Promise.all([getEntry({ id }), listCategories()]);

  if (!entryResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar entry: {entryResult.error.message}</p>;
  }
  if (!categoriesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar categorias: {categoriesResult.error.message}</p>;
  }

  const entry = entryResult.data;
  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Editar entry</h1>
        <span className="text-sm text-gray-500">{entry.status === "published" ? "publicada" : "rascunho"}</span>
      </div>

      <div className="rounded border border-gray-200 bg-white p-4">
        <EditEntryForm
          entryId={entry.id}
          title={entry.title}
          slug={entry.slug}
          body={extractBody(entry.data)}
          categoryId={entry.categoryId}
          mediaId={entry.mediaId}
          categories={categoriesResult.data}
        />
      </div>

      {entry.status === "draft" && (
        <div className="rounded border border-gray-200 bg-white p-4">
          <PublishButton entryId={entry.id} />
        </div>
      )}
    </div>
  );
}
