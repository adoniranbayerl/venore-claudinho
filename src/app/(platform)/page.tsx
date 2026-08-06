import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { getEntryBody, getEntryComposition, getPublishedEntryBySlug, recordEntryView } from "@/contexts/cms";
import { getCurrentUser } from "@/contexts/auth";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/page-builder/block-renderer";

// force-dynamic: conteúdo (CMS) e tema ativo são runtime-configuráveis, sem rebuild
// (docs/venore-docks.md — "Sobre temas").
export const dynamic = "force-dynamic";

// Home é a entry reservada com categoryId null e slug "home" — convenção documentada no plano
// desta sessão, não string vazia (evita abrir exceção na validação de slug não-vazio do form).
const HOME_SLUG = "home";

export default async function HomePage() {
  const result = await getPublishedEntryBySlug({ categoryId: null, slug: HOME_SLUG });
  const currentUser = await getCurrentUser();
  const isAuthenticated = currentUser.success && Boolean(currentUser.data);

  // Privacidade por conteúdo (Fase 2/C7): "authenticated" sem sessão cai no mesmo empty state de
  // "nenhuma entry home ainda" — a home nunca 404 (é a raiz do site), então blindar o conteúdo
  // fechado significa tratá-lo como se a entry não existisse pra esse visitante.
  const entry = result.success && result.data && (result.data.visibility === "public" || isAuthenticated) ? result.data : null;

  if (entry) {
    recordEntryView(entry.id);
    const compositionResult = await getEntryComposition({ id: entry.id });
    const composition = compositionResult.success ? compositionResult.data : null;

    // Home é composta por seções inteiras (hero própria com seu h1, cards, CTAs) — diferente de
    // uma entry "artigo" (blogroll/[...slug]/page.tsx), que precisa do título como cabeçalho fixo
    // porque o corpo é só texto corrido. Um <h1>{entry.title}</h1> genérico aqui duplicava o h1
    // de verdade da composição (bug reportado nesta sessão: "Inicio" cru, sem estilo, acima do
    // hero) — a composição é sempre a fonte do h1 da home, nunca o título bruto da entry.
    return composition ? (
      <BlockRenderer blocks={composition} mode="published" />
    ) : (
      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{entry.title}</h1>
        <p className="mt-2 text-muted-foreground">{getEntryBody(entry.data)}</p>
      </article>
    );
  }

  const adminGate = await getAdminPageData();

  if (!adminGate.granted && isAuthenticated) {
    redirect("/academy");
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <EmptyState
        title="Venore Docks"
        description="Painel administrativo e área do aluno da Venore Docks."
        action={
          <div className="flex flex-col items-center gap-3">
            {!adminGate.granted && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/cursos">Ver cursos</Link>
                </Button>
                <Button asChild>
                  <Link href="/api/auth/signin">Entrar</Link>
                </Button>
              </div>
            )}
            {adminGate.granted && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/cms/entries/new" className="inline-flex items-center gap-2 text-muted-foreground/56">
                  <Settings2 className="size-4" strokeWidth={1.5} />
                  Criar entry &quot;home&quot; no CMS
                </Link>
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
