import { NextResponse } from "next/server";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { getBoardFeed } from "@/plugins/helpdesk";

// Feed do painel de TV (§2.6) — GET /api/helpdesk/board/[token], despachado por
// src/app/api/[plugin]/[[...slug]]/route.ts (que já declara `dynamic = "force-dynamic"`). SEM
// sessão/authorizeActor: o token do painel substitui a autenticação, mesmo racional das rotas de
// saída do broadcast. A página faz polling aqui a cada `refresh_seconds`.
//
// 200 → BoardFeedView  ·  404 → { error } (token inválido/inexistente ou plugin desligado)

const DISABLED = NextResponse.json({ error: "O plugin Chamados está desabilitado." }, { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  if (!(await isPluginActive("helpdesk"))) return DISABLED;

  const { token } = await params;
  const result = await getBoardFeed(token);
  if (!result.success) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 404 });
  }

  // Sem cache — o polling precisa do estado corrente da fila a cada chamada.
  return NextResponse.json(result.data, { headers: { "cache-control": "no-store" } });
}
