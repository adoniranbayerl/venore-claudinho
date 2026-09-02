import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getFilesystemStorageRoot, readFilesystemObjectContentType } from "@/infrastructure/storage/filesystem-storage-adapter";
import { resolveWithinRoot } from "@/infrastructure/storage/filesystem-path";

// Serve um objeto do driver de storage "filesystem" (MEDIA_STORAGE_DRIVER=filesystem). storagePort
// grava em MEDIA_FILESYSTEM_ROOT e persiste esta URL relativa no registro de mídia; a página
// (inclusive a view de saída da TV, servida pela mesma origem) carrega o <img>/<audio> por aqui.
// Fora desse driver a rota nem existe pra quem chama (404) — os outros drivers têm URL própria.
//
// Sem sessão de propósito: paridade com o driver vercel-blob, onde todo asset é servível por uma
// URL pública não-adivinhável (a key tem um UUID). Um modelo de auth por asset seria uma mudança
// nos dois drivers, fora do escopo.
export const dynamic = "force-dynamic";

// Fallback de contentType quando o sidecar .meta.json sumiu — cobre os tipos de MEDIA_ALLOWED_TYPES.
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
};

function parseSingleRange(header: string | null, size: number): { start: number; end: number } | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  let start = rawStart === "" ? NaN : Number(rawStart);
  let end = rawEnd === "" ? NaN : Number(rawEnd);
  if (Number.isNaN(start) && Number.isNaN(end)) return null;
  if (Number.isNaN(start)) {
    // sufixo: últimos N bytes
    start = Math.max(0, size - end);
    end = size - 1;
  } else if (Number.isNaN(end)) {
    end = size - 1;
  }
  if (start < 0 || end >= size || start > end) return null;
  return { start, end };
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }): Promise<NextResponse> {
  if ((process.env.MEDIA_STORAGE_DRIVER ?? "local") !== "filesystem") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { key: segments } = await params;
  const key = (segments ?? []).map((segment) => decodeURIComponent(segment)).join("/");
  const absolutePath = resolveWithinRoot(getFilesystemStorageRoot(), key);
  if (!absolutePath || key.length === 0) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  let size: number;
  try {
    const info = await stat(absolutePath);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const contentType =
    (await readFilesystemObjectContentType(key)) ??
    CONTENT_TYPE_BY_EXTENSION[path.extname(key).toLowerCase()] ??
    "application/octet-stream";

  // A key carrega um UUID por objeto — o conteúdo de uma key nunca muda, então cache longo/imutável.
  const baseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  const range = parseSingleRange(request.headers.get("range"), size);
  const full = await readFile(absolutePath);

  if (range) {
    const slice = full.subarray(range.start, range.end + 1);
    return new NextResponse(slice, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Length": String(slice.byteLength),
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      },
    });
  }

  return new NextResponse(full, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(size) },
  });
}
