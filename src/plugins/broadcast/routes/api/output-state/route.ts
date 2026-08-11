import { NextResponse } from "next/server";
import { getOutputState } from "@/plugins/broadcast";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

// Snapshot HTTP normal do estado de uma saída — usado pelo client da view de saída (Fase 4) pra
// resincronizar sempre que a rota SSE (./events) avisa que algo mudou, em vez de tentar remontar
// o estado a partir do delta do evento (mais simples e mais robusto contra evento perdido/fora de
// ordem: qualquer evento só significa "vá buscar o estado atual de novo").
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }): Promise<NextResponse> {
  if (!(await isPluginActive("broadcast"))) {
    return NextResponse.json({ error: "O plugin Broadcast Studio está desabilitado." }, { status: 404 });
  }

  const { token } = await params;
  const result = await getOutputState({ token });
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 404 });
  }

  return NextResponse.json(result.data);
}
