import { NextResponse } from "next/server";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { listMyNotifications, markNotificationsRead, sweepAutoClose, sweepSlaAtRisk } from "@/plugins/helpdesk";

// Entrega in-app das notificações (§2.3) — despachado por src/app/api/[plugin]/[[...slug]]/route.ts
// (que já declara `export const dynamic = "force-dynamic"`). Autenticação é por SESSÃO: os
// handlers dos use cases resolvem o ator via getCurrentUser() e recortam pelas linhas do próprio
// usuário; não há permission (self-service, como o portal).
//
// GET  → { notifications: HelpdeskNotificationView[], unreadCount }  (polling ~30 s no admin e no
//        app do técnico)
// POST → body { ids?: string[] } → marca lidas (vazio = todas) → { markedCount, unreadCount }

const DISABLED = NextResponse.json({ error: "O plugin Chamados está desabilitado." }, { status: 404 });

export async function GET(): Promise<NextResponse> {
  if (!(await isPluginActive("helpdesk"))) return DISABLED;

  // Sem scheduler no v1 (§2.4/§5/§8): o batimento deste polling (~30 s) carrega as varreduras sem
  // job dedicado — `sla_at_risk` para chamados que cruzaram 80 % do prazo (Fase 4) e o auto-close
  // de chamados `resolved` cuja janela de reabertura de N dias venceu (Fase 7). Best-effort —
  // nenhuma delas derruba a entrega das notificações.
  try {
    await sweepSlaAtRisk();
  } catch {
    // silencioso: a próxima chamada tenta de novo
  }
  try {
    await sweepAutoClose();
  } catch {
    // silencioso: a próxima chamada tenta de novo
  }

  const result = await listMyNotifications();
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 401 });
  }
  return NextResponse.json(result.data);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isPluginActive("helpdesk"))) return DISABLED;

  let ids: string[] | undefined;
  try {
    const body = (await request.json()) as { ids?: unknown } | null;
    if (body && Array.isArray(body.ids)) {
      ids = body.ids.filter((id): id is string => typeof id === "string");
    }
  } catch {
    // corpo vazio / não-JSON → marca todas as não lidas
  }

  const result = await markNotificationsRead({ ids });
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 401 });
  }
  return NextResponse.json(result.data);
}
