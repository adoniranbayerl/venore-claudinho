import { NextResponse } from "next/server";
import { resolveApiPluginRoute } from "@/platform/plugin-routing/resolve-api-route";
import type { PluginApiMethod } from "@/platform/plugin-routing/types";

// Único ponto de entrada de rota de API de plugin em app/ — nenhuma pasta nomeada por plugin
// existe mais debaixo de api/** (era api/broadcast, api/birthdays, api/academy). A tabela de
// rotas de cada plugin (src/plugins/<nome>/routes/route-table.ts) decide o resto.
//
// force-dynamic precisa ficar declarado aqui, direto no arquivo de rota — Next.js só lê route
// segment config de export direto no arquivo dentro de app/, nunca via re-export. Um dos handlers
// de baixo (broadcast output-events, SSE) exige isso; aplicar pra todos os métodos/plugins aqui é
// seguro (nenhum outro handler depende de cache estático) e evita precisar de config por rota.
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ plugin: string; slug?: string[] }> };

async function dispatch(method: PluginApiMethod, request: Request, { params }: RouteContext): Promise<Response> {
  const { plugin, slug } = await params;
  const resolved = await resolveApiPluginRoute(plugin, slug ?? [], method);
  if (!resolved) {
    return NextResponse.json({ error: "Rota não encontrada." }, { status: 404 });
  }

  return resolved.handler(request, { params: Promise.resolve(resolved.params) });
}

export function GET(request: Request, context: RouteContext) {
  return dispatch("GET", request, context);
}

export function POST(request: Request, context: RouteContext) {
  return dispatch("POST", request, context);
}

export function PUT(request: Request, context: RouteContext) {
  return dispatch("PUT", request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return dispatch("PATCH", request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return dispatch("DELETE", request, context);
}
