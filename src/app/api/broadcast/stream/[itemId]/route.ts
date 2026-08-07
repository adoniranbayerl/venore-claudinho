import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { parseRangeHeader, resolveStreamableItem } from "@/plugins/broadcast";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

function statusForErrorCode(code: string): number {
  if (code.endsWith("not_found") || code.endsWith("file_not_found") || code.endsWith("media_not_found")) return 404;
  return 400;
}

// Sem checagem de sessão/RBAC de propósito: quem embute esta URL é a view de saída (Fase 4),
// acessada por token, não por login — a TV não faz fluxo de autenticação interativo. A superfície
// de exposição (qualquer um na rede local com o itemId consegue baixar o vídeo sem o token) é uma
// troca deliberada pro cenário "servidor local, rede local apenas" (ver plano da Fase 0) — não
// serve pra um deploy exposto à internet.
export async function GET(request: Request, { params }: { params: Promise<{ itemId: string }> }): Promise<NextResponse> {
  if (!(await isPluginActive("broadcast"))) {
    return NextResponse.json({ error: "O plugin Broadcast Studio está desabilitado." }, { status: 404 });
  }

  const { itemId } = await params;
  const resolved = await resolveStreamableItem({ itemId });
  if (!resolved.success) {
    return NextResponse.json({ error: resolved.error.message }, { status: statusForErrorCode(resolved.error.code) });
  }

  if (resolved.data.kind === "redirect") {
    return NextResponse.redirect(resolved.data.url, 302);
  }

  const { absolutePath, contentType, size } = resolved.data;
  const rangeHeader = request.headers.get("range");

  if (!rangeHeader) {
    const stream = Readable.toWeb(createReadStream(absolutePath)) as ReadableStream;
    return new NextResponse(stream, {
      status: 200,
      headers: { "Content-Type": contentType, "Content-Length": String(size), "Accept-Ranges": "bytes" },
    });
  }

  const range = parseRangeHeader(rangeHeader, size);
  if (!range) {
    return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }

  const stream = Readable.toWeb(createReadStream(absolutePath, { start: range.start, end: range.end })) as ReadableStream;
  return new NextResponse(stream, {
    status: 206,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(range.end - range.start + 1),
      "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      "Accept-Ranges": "bytes",
    },
  });
}
