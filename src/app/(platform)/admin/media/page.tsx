import { ImageOff } from "lucide-react";
import { listMedia } from "@/contexts/media";
import { getMediaPageData } from "@/platform/admin-shell/get-media-page-data";
import { EmptyState } from "@/components/empty-state";
import { MediaItem } from "./_components/media-item";
import { UploadMediaForm } from "./_components/upload-media-form";

export default async function MediaAdminPage() {
  const gate = await getMediaPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar mídia.</p>
      </div>
    );
  }

  const mediaResult = await listMedia();
  if (!mediaResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar a mídia agora. Tente recarregar a página.</p>;
  }

  const files = mediaResult.data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Mídia</h1>
        <p className="mt-1 text-sm text-muted-foreground">Envie e gerencie as imagens e arquivos usados no conteúdo do site.</p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <h2 className="text-sm font-semibold text-foreground">Enviar arquivo</h2>
        <div className="mt-3">
          <UploadMediaForm />
        </div>
      </section>

      {files.length === 0 ? (
        <EmptyState
          icon={<ImageOff className="size-8" strokeWidth={1.5} />}
          title="Nenhum arquivo enviado ainda"
          description="Envie uma imagem acima para poder usá-la em páginas e conteúdos."
        />
      ) : (
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
              visibility={file.visibility}
            />
          ))}
        </section>
      )}
    </div>
  );
}
