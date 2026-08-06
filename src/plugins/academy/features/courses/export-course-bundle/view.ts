import { buildExportZip } from "@/contexts/import-export";
import type { ExportCourseBundleData } from "./types";

// Formata o DTO (manifest + bytes soltos) pro artefato binário de saída (.zip) — quem consome
// isso é a rota de download (app/api/academy/courses/[id]/export/route.ts), não o handler em si
// (mesmo padrão de contexts/import-export/features/export-site/export-site-bundle/view.ts).
export function toExportZip(data: ExportCourseBundleData): Buffer {
  return buildExportZip(data.manifest, data.files);
}
