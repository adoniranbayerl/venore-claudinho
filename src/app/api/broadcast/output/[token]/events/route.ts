import { NextResponse } from "next/server";
import { getOutputState, subscribeToOutputEvents, type BroadcastOutputEvent } from "@/plugins/broadcast";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

// Nunca deve ser respondida a partir de cache estático — é um stream vivo por conexão.
export const dynamic = "force-dynamic";

// Sem checagem de sessão/RBAC de propósito — mesmo racional de app/api/broadcast/stream: acesso
// por token (o mesmo token da URL da view de saída), não por login (ver contracts/types.ts).
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }): Promise<Response> {
  if (!(await isPluginActive("broadcast"))) {
    return NextResponse.json({ error: "O plugin Broadcast Studio está desabilitado." }, { status: 404 });
  }

  const { token } = await params;
  const initialState = await getOutputState({ token });
  if (!initialState.success) {
    return NextResponse.json({ error: initialState.error.message }, { status: 404 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      // Primeiro evento é sempre o snapshot completo (hydration) — inclusive numa reconexão
      // automática do EventSource depois de horas de TV ligada, nunca só deltas a partir daí.
      send({ type: "state", state: initialState.data });

      unsubscribe = subscribeToOutputEvents(token, (event: BroadcastOutputEvent) => {
        send(event);
      });
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
