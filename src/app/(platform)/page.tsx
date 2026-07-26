import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { getEntryBody, getPublishedEntryBySlug } from "@/contexts/cms";
import { getCurrentUser } from "@/contexts/auth";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

// force-dynamic: conteúdo (CMS) e tema ativo são runtime-configuráveis, sem rebuild
// (docs/venore-docks.md — "Sobre temas").
export const dynamic = "force-dynamic";

// Home é a entry reservada com categoryId null e slug "home" — convenção documentada no plano
// desta sessão, não string vazia (evita abrir exceção na validação de slug não-vazio do form).
const HOME_SLUG = "home";

export default async function HomePage() {
  const result = await getPublishedEntryBySlug({ categoryId: null, slug: HOME_SLUG });

  if (result.success && result.data) {
    const entry = result.data;

    return (
      <article>
        <h1>{entry.title}</h1>
        <p>{getEntryBody(entry.data)}</p>
      </article>
    );
  }

  const adminGate = await getAdminPageData();

  if (!adminGate.granted) {
    const currentUser = await getCurrentUser();

    if (currentUser.success && currentUser.data) {
      redirect("/academy");
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <EmptyState
        title="Venore Docks"
        description="Painel administrativo e área do aluno da Venore Docks."
        action={
          <div className="flex flex-col items-center gap-3">
            {!adminGate.granted && (
              <Button asChild>
                <Link href="/api/auth/signin">Entrar</Link>
              </Button>
            )}
            {adminGate.granted && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/cms/entries/new" className="inline-flex items-center gap-2 text-text-tertiary">
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
