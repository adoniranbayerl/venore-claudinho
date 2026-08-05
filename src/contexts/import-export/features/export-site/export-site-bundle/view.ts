import { buildExportZip } from "../../../zip-codec";
import type { ExportSiteBundleData } from "./types";

// Formata o DTO (manifest + bytes soltos) pro artefato binário de saída (.zip) — quem consome
// isso é a rota de download (app/api/import-export/export/route.ts), não o handler em si (mesmo
// padrão de toEntryView: view.ts nunca é chamado de dentro da própria cadeia handler→service).
export function toExportZip(data: ExportSiteBundleData): Buffer {
  return buildExportZip(data.manifest, data.files);
}
