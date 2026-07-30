import Link from "next/link";
import { Cake } from "lucide-react";
import { listBirthdays, MONTH_LABELS, type BirthdayAdminView } from "@/plugins/birthdays";
import { getBirthdaysPageData } from "@/platform/admin-shell/get-birthdays-page-data";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { CreateBirthdayDialog } from "./_components/create-birthday-dialog";
import { BirthdayTable } from "./_components/birthday-table";
import { daysUntilNextOccurrence } from "./_components/next-occurrence";

export default async function BirthdaysAdminPage() {
  const gate = await getBirthdaysPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para ver os aniversariantes.</p>
      </div>
    );
  }

  const result = await listBirthdays();
  if (!result.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aniversariantes: {result.error.message}</p>;
  }

  const birthdays = result.data;
  const now = new Date();
  const withDaysUntil = birthdays.map((birthday) => ({
    ...birthday,
    daysUntil: daysUntilNextOccurrence(birthday.month, birthday.day, now),
  }));

  const today = withDaysUntil.filter((birthday) => birthday.daysUntil === 0);
  const thisWeek = withDaysUntil.filter((birthday) => birthday.daysUntil > 0 && birthday.daysUntil <= 7);

  const byMonth = new Map<number, BirthdayAdminView[]>();
  for (const birthday of birthdays) {
    const monthGroup = byMonth.get(birthday.month) ?? [];
    monthGroup.push(birthday);
    byMonth.set(birthday.month, monthGroup);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Aniversariantes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastro de aniversários por mês e dia — sem ano de nascimento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/birthdays/appearance">Aparência</Link>
          </Button>
          {birthdays.length > 0 && <CreateBirthdayDialog />}
        </div>
      </div>

      {birthdays.length === 0 ? (
        <EmptyState
          icon={<Cake className="size-8" strokeWidth={1.5} />}
          title="Nenhum aniversariante cadastrado"
          description="Cadastre o primeiro aniversariante para começar a montar o quadro do mês."
          action={<CreateBirthdayDialog />}
        />
      ) : (
        <div className="space-y-8">
          {today.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-caps text-primary">Hoje</h2>
              <div className="rounded-panel border border-border bg-card">
                <BirthdayTable birthdays={today} />
              </div>
            </section>
          )}

          {thisWeek.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Esta semana</h2>
              <div className="rounded-panel border border-border bg-card">
                <BirthdayTable birthdays={thisWeek} />
              </div>
            </section>
          )}

          <section className="space-y-6">
            {Array.from(byMonth.keys())
              .sort((a, b) => a - b)
              .map((month) => (
                <div key={month} className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">
                    {MONTH_LABELS[month]}
                  </h2>
                  <div className="rounded-panel border border-border bg-card">
                    <BirthdayTable birthdays={byMonth.get(month) ?? []} />
                  </div>
                </div>
              ))}
          </section>
        </div>
      )}
    </div>
  );
}
