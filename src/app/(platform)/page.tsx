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

// Fallback da home (sem entry "home" no CMS): vai direto pros cursos — pedido do dono, "ninguém
// vai ler, já aponta pros cursos". Só um título curto + botão de entrar e a grade de cursos. Aluno
// logado nunca chega aqui (é redirecionado pra /academy); serve o visitante anônimo e o admin.
async function CoursesHome({ canManage }: { canManage: boolean }) {
  const [coursesResult, brand, currentUser] = await Promise.all([listPublicCourses(), getBrandConfig(), getCurrentUser()]);
  const isAuthenticated = currentUser.success && Boolean(currentUser.data);
  const courses = coursesResult.success ? coursesResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{brand.siteName}</h1>
        <Button asChild size="sm" variant={isAuthenticated ? "outline" : "default"}>
          <Link href={isAuthenticated ? "/academy" : "/api/auth/signin"}>
            {isAuthenticated ? "Meus cursos" : "Entrar"} <ArrowRight className="size-4" aria-hidden="true" />
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
                    {isAuthenticated ? "Abrir" : "Começar"} <ArrowRight className="size-3.5" aria-hidden="true" />
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {canManage && (
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
      )}
    </div>
  );
}

export default async function HomePage() {
  const result = await getPublishedEntryBySlug({ categoryId: null, slug: HOME_SLUG });
  const currentUser = await getCurrentUser();
  const isAuthenticated = currentUser.success && Boolean(currentUser.data);

  // Privacidade por conteúdo: "authenticated" sem sessão cai no mesmo fallback de "sem entry home".
  const entry = result.success && result.data && (result.data.visibility === "public" || isAuthenticated) ? result.data : null;

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

  const adminGate = await getAdminPageData();

  // Aluno logado (sem acesso ao admin) vai direto pro dashboard dele.
  if (!adminGate.granted && isAuthenticated) {
    redirect("/academy");
  }

  return <CoursesHome canManage={adminGate.granted} />;
}
