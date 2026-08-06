import { unzipSync, zipSync } from "fflate";

export const MANIFEST_ENTRY_NAME = "manifest.json";
export const ASSETS_DIR = "assets/";

export type ZipFileEntry = { path: string; data: Buffer };

// Único lugar que sabe empacotar/desempacotar o .zip do pacote de import/export — o resto do
// context só lida com manifest + Buffer de arquivo, nunca com fflate direto (mesmo raciocínio de
// storagePort isolar @vercel/blob do resto do domínio de media). Genérico sobre o tipo de
// manifest (não fixo em ExportManifest) porque outros contexts/plugins reaproveitam o mesmo
// envelope .zip pro próprio formato de pacote — ver academy/features/courses/export-course-bundle
// (barrel deste context reexporta esta função, único jeito de um plugin chegar nela sem violar o
// boundary de "só barrel + contracts/" de outro context).
export function buildExportZip<TManifest>(manifest: TManifest, files: ZipFileEntry[]): Buffer {
  const entries: Record<string, Uint8Array> = {
    [MANIFEST_ENTRY_NAME]: new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
  };
  for (const file of files) {
    entries[file.path] = new Uint8Array(file.data);
  }
  return Buffer.from(zipSync(entries, { level: 6 }));
}

export type ParsedExportZip = { manifest: unknown; files: Map<string, Buffer> };

export function parseExportZip(zipBuffer: Buffer): ParsedExportZip {
  const entries = unzipSync(new Uint8Array(zipBuffer));

  const manifestBytes = entries[MANIFEST_ENTRY_NAME];
  if (!manifestBytes) {
    throw new Error(`Arquivo "${MANIFEST_ENTRY_NAME}" não encontrado dentro do .zip.`);
  }

  const manifest: unknown = JSON.parse(new TextDecoder().decode(manifestBytes));

  const files = new Map<string, Buffer>();
  for (const [path, bytes] of Object.entries(entries)) {
    if (path.startsWith(ASSETS_DIR)) {
      files.set(path, Buffer.from(bytes));
    }
  }

  return { manifest, files };
}
