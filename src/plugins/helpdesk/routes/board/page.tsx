import { notFound } from "next/navigation";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { getBoard } from "@/plugins/helpdesk";
import { BoardScreen } from "../../components/board/board-screen";

export const dynamic = "force-dynamic";

// Painel de TV / kanban (§1 superfície 5, §2.6). Rota standalone FORA de (platform) de propósito
// (§4, exceção do AGENTS.md §1.1, igual broadcast/out e o quiosque): sem header/nav/footer — é
// uma tela de parede. O shim que a expõe está em src/app/chamados/painel/[token]/page.tsx.
// O primeiro render resolve só a casca (rótulo/layout/intervalo); os cards chegam por polling em
// GET /api/helpdesk/board/[token] a cada `refreshSeconds` (BoardScreen, client).
export default async function HelpdeskBoardPage({ params }: { params: Promise<{ token: string }> }) {
  if (!(await isPluginActive("helpdesk"))) {
    notFound();
  }

  const { token } = await params;
  const result = await getBoard(token);
  if (!result.success) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BoardScreen token={token} initial={result.data} />
    </main>
  );
}
