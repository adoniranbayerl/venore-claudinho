import { getImportExportPageData } from "@/platform/admin-shell/get-import-export-page-data";
import { ImportExportPanel } from "./_components/import-export-panel";

export default async function ImportExportAdminPage() {
  const gate = await getImportExportPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Importar/exportar o site inteiro exige permissão de gerenciar tags, categorias, conteúdos, menus e mídia ao mesmo tempo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Importar/Exportar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Migre o conteúdo editorial e a biblioteca de mídia entre instalações do Venore.</p>
      </div>

      <ImportExportPanel />
    </div>
  );
}
