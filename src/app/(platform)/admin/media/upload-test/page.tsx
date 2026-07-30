import { getMediaPageData } from "@/platform/admin-shell/get-media-page-data";
import { UploadTestForm } from "./_components/upload-test-form";

// Página de teste mínima do pipeline de client-upload (docs/media/blob-spec.md) — não é a UI da
// biblioteca de mídia, só exercita o caminho ponta a ponta pra validação manual.
export default async function MediaUploadTestPage() {
  const gate = await getMediaPageData();
  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar mídia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Teste do pipeline de upload</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exercita o fluxo de client-upload direto ao Blob Store, ponta a ponta — pedido de ticket, upload e confirmação de registro.
        </p>
      </div>
      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <UploadTestForm />
      </section>
    </div>
  );
}
