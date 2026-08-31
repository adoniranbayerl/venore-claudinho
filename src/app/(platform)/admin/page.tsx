import Link from "next/link";
import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { getAcademyOverview, type AcademyOverview } from "@/plugins/academy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import { signOutAction } from "@/app/(auth)/actions";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  restricted: { label: "Restrito", variant: "outline" as const },
  public: { label: "Público", variant: "default" as const },
};

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-panel border border-border bg-card p-4 shadow-panel">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold tracking-caps uppercase">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground/56">{hint}</p>}
    </div>
  );
}

function AcademyDashboard({ overview }: { overview: AcademyOverview }) {
  const { totals, courses, pendingSubmissions } = overview;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<GraduationCap className="size-4" aria-hidden="true" />}
          label="Cursos"
          value={totals.courses}
          hint={`${totals.publishedCourses} publicado(s) · ${totals.lessons} aulas`}
        />
        <StatTile icon={<Users className="size-4" aria-hidden="true" />} label="Matrículas" value={totals.enrollments} hint={`${totals.activeStudents} aluno(s)`} />
        <StatTile
          icon={<ClipboardCheck className="size-4" aria-hidden="true" />}
          label="Aguardando revisão"
          value={totals.pendingReviews}
          hint="entregas de atividade"
        />
        <StatTile
          icon={<BookOpen className="size-4" aria-hidden="true" />}
          label="Engajamento médio"
          value={
            courses.filter((c) => c.enrollmentCount > 0).length > 0
              ? `${Math.round(
                  courses.filter((c) => c.enrollmentCount > 0).reduce((s, c) => s + c.engagementPercent, 0) /
                    courses.filter((c) => c.enrollmentCount > 0).length,
                )}%`
              : "—"
          }
          hint="aulas feitas / matrículas"
        />
      </div>

      <div className="rounded-panel border border-border bg-card shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Cursos</h2>
          <Link href="/admin/academy" className="text-xs font-medium text-primary hover:underline">
            Gerenciar
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nenhum curso criado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">
                  <th className="px-4 py-2 font-semibold">Curso</th>
                  <th className="px-3 py-2 font-semibold tabular-nums">Matrículas</th>
                  <th className="px-3 py-2 font-semibold">Engajamento</th>
                  <th className="px-3 py-2 font-semibold tabular-nums">Nota média</th>
                  <th className="px-3 py-2 font-semibold tabular-nums">Revisar</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/academy/courses/${course.id}`} className="font-medium text-foreground hover:underline">
                        {course.title}
                      </Link>
                      <span className="ml-2 align-middle">
                        <Badge variant={STATUS_BADGE[course.status].variant} className="text-[10px]">
                          {STATUS_BADGE[course.status].label}
                        </Badge>
                      </span>
                      <p className="text-xs text-muted-foreground/56">{course.lessonCount} aulas</p>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{course.enrollmentCount}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Progress value={course.engagementPercent} className="w-20" />
                        <span className="text-xs text-muted-foreground tabular-nums">{course.engagementPercent}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {course.avgQuizGrade === null ? "—" : course.avgQuizGrade.toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {course.pendingReviews > 0 ? (
                        <Link href={`/admin/academy/courses/${course.id}/enrolled`} className="font-medium text-warning hover:underline">
                          {course.pendingReviews}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground/56">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-panel border border-border bg-card shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Entregas aguardando revisão</h2>
          <Link href="/admin/academy/messages" className="text-xs font-medium text-primary hover:underline">
            Mensagens
          </Link>
        </div>
        {pendingSubmissions.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nenhuma entrega pendente. Tudo em dia.</p>
        ) : (
          <ul className="divide-y divide-border">
            {pendingSubmissions.map((submission) => (
              <li key={submission.submissionId}>
                <Link
                  href={`/admin/academy/courses/${submission.courseId}/enrolled`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {submission.studentName} — {submission.activityTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground/56">
                      {submission.courseTitle} · {submission.lessonTitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground/56 tabular-nums">
                    {dateFormatter.format(submission.submittedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const gate = await getAdminPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para acessar a área administrativa.</p>
      </div>
    );
  }

  const academyGate = await getAcademyPageData();
  const overviewResult = academyGate.granted ? await getAcademyOverview() : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Painel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhamento de matrículas e desempenho dos alunos.</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>

      {overviewResult?.success ? (
        <AcademyDashboard overview={overviewResult.data} />
      ) : (
        <EmptyState
          icon={<GraduationCap className="size-8" strokeWidth={1.5} />}
          title="Sem dados da Academy"
          description={
            academyGate.granted
              ? "Não foi possível carregar o resumo dos cursos agora."
              : "Escolha uma área no menu ao lado para começar."
          }
        />
      )}
    </div>
  );
}
