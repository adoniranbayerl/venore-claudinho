import { NextResponse } from "next/server";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { submitKioskTicket } from "@/plugins/helpdesk";

// Submissão anônima do quiosque (§2.5) — POST /api/helpdesk/kiosk/[token], despachado por
// src/app/api/[plugin]/[[...slug]]/route.ts (que já declara `dynamic = "force-dynamic"`). SEM
// sessão/authorizeActor: o token do quiosque + o throttle por token (no handler do use case)
// substituem a autenticação, mesmo racional das rotas de saída do broadcast.
//
// body JSON: { description, location?, contact?, requesterName?, queueId? }
// 200 → { reference, trackingToken, trackingPath }
// 4xx → { error }

const DISABLED = NextResponse.json({ error: "O plugin Chamados está desabilitado." }, { status: 404 });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  if (!(await isPluginActive("helpdesk"))) return DISABLED;

  const { token } = await params;

  let body: Record<string, unknown> = {};
  try {
    const parsed = (await request.json()) as unknown;
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const str = (value: unknown): string | null =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

  const result = await submitKioskTicket({
    token,
    description: typeof body.description === "string" ? body.description : "",
    location: str(body.location),
    contact: str(body.contact),
    requesterName: str(body.requesterName),
    queueId: str(body.queueId),
  });

  if (!result.success) {
    const status = result.error.code.endsWith("throttled") ? 429 : 400;
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status });
  }

  return NextResponse.json(result.data);
}
