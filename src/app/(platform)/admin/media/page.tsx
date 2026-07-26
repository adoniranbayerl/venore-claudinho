import { listMedia } from "@/contexts/media";
import { getMediaPageData } from "@/platform/admin-shell/get-media-page-data";
import { MediaItem } from "./_components/media-item";
import { UploadMediaForm } from "./_components/upload-media-form";

export default async function MediaAdminPage() {
  const gate = await getMediaPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar mídia.</p>
      </div>
    );
  }

  const mediaResult = await listMedia();
  if (!mediaResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar mídia: {mediaResult.error.message}</p>;
  }

  const files = mediaResult.data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Mídia</h1>
        <p className="mt-1 text-sm text-text-secondary">Envie e gerencie os arquivos usados pelo CMS.</p>
      </div>

      <section className="rounded border border-border-subtle bg-surface-panel p-4">
        <h2 className="text-sm font-semibold text-text-primary">Enviar arquivo</h2>
        <div className="mt-3">
          <UploadMediaForm />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {files.map((file) => (
          <MediaItem
            key={file.id}
            id={file.id}
            filename={file.filename}
            url={file.url}
            mimeType={file.mimeType}
            size={file.size}
            createdAt={file.createdAt.toISOString()}
          />
        ))}
        {files.length === 0 && <p className="text-sm text-text-tertiary">Nenhum arquivo enviado ainda.</p>}
      </section>
    </div>
  );
}
