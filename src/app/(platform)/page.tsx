import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Settings2 } from "lucide-react";
import { getEntryBody, getEntryComposition, getPublishedEntryBySlug, recordEntryView } from "@/contexts/cms";
import { getCurrentUser } from "@/contexts/auth";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { CourseCover, listPublicCourses } from "@/plugins/academy";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/page-builder/block-renderer";

// force-dynamic: conteúdo (CMS) e tema ativo são runtime-configuráveis, sem rebuild
// (docs/venore-docks.md — "Sobre temas").
export const dynamic = "force-dynamic";

// Home é a entry reservada com categoryId null e slug "home".
const HOME_SLUG = "home";

// Painel de "/" quando NÃO há entry "home" no CMS. Plataforma fechada: visitante sem sessão é
// redirecionado pro /login e aluno logado pro /academy antes daqui — então isto só é visto pelo
// admin. Título curto + grade de cursos publicados + atalhos de admin.
async function CoursesHome() {
  const [coursesResult, brand] = await Promise.all([listPublicCourses(), getBrandConfig()]);
  const courses = coursesResult.success ? coursesResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{brand.siteName}</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/academy">
            Ver como aluno <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-8" strokeWidth={1.5} />}
          title="Nenhum curso disponível ainda"
          description="Os cursos aparecem aqui assim que forem publicados."
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5">
          {courses.map((course) => (
            <Link key={course.id} href={`/academy/${course.slug}`} className="group block">
              <article className="flex h-full flex-col overflow-hidden rounded-panel border border-border bg-card ui-motion-base group-hover:shadow-float">
                <CourseCover
                  coverMediaId={course.coverMediaId}
                  className="w-full rounded-none object-cover ui-motion-emphasis group-hover:scale-105"
                />
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
                    {course.lessonCount} {course.lessonCount === 1 ? "aula" : "aulas"}
                  </p>
                  <h2 className="text-base font-semibold text-foreground">{course.title}</h2>
                  <p className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                    Abrir <ArrowRight className="size-3.5" aria-hidden="true" />
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin" className="text-muted-foreground/56">
            <Settings2 className="size-4" strokeWidth={1.5} /> Painel
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/cms/entries/new" className="text-muted-foreground/56">
            Personalizar a home no CMS
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const isAuthenticated = currentUser.success && Boolean(currentUser.data);

  // Plataforma fechada: visitante sem sessão sempre cai no login (pedido do dono, "aluno não
  // logado deve cair em /login SEMPRE"). Não há landing pública.
  if (!isAuthenticated) {
    redirect("/login");
  }

  const adminGate = await getAdminPageData();

  // Aluno logado (sem acesso ao admin) vai direto pro dashboard dele.
  if (!adminGate.granted) {
    redirect("/academy");
  }

  // Daqui pra baixo só admin: mostra a entry "home" do CMS se existir, senão o painel de cursos.
  const result = await getPublishedEntryBySlug({ categoryId: null, slug: HOME_SLUG });
  const entry = result.success && result.data ? result.data : null;

  if (entry) {
    recordEntryView(entry.id);
    const compositionResult = await getEntryComposition({ id: entry.id });
    const composition = compositionResult.success ? compositionResult.data : null;

    return composition ? (
      <BlockRenderer blocks={composition} mode="published" />
    ) : (
      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{entry.title}</h1>
        <p className="mt-2 text-muted-foreground">{getEntryBody(entry.data)}</p>
      </article>
    );
  }

  return <CoursesHome />;
}
