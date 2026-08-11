import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { Cake } from "lucide-react";
import { getBirthdayAppearance, listBirthdays, MONTH_LABELS, type BirthdayAdminView } from "@/plugins/birthdays";
import { getBirthdaysPageData } from "@/platform/admin-shell/get-birthdays-page-data";
import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { resolveBrandAesthetics } from "@/platform/theme-rendering/resolve-brand-aesthetics";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatTile } from "@/components/admin-stat-tile";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BirthdaysByMonthChart, type BirthdaysByMonthDatum } from "./birthdays-by-month-chart";
import { CreateBirthdayDialog } from "./create-birthday-dialog";
import { ImportBirthdaysCsvDialog } from "./import-birthdays-csv-dialog";
import { PrintBirthdaysDialog } from "./print-birthdays-dialog";
import { BirthdayTable } from "./birthday-table";
import { daysUntilNextOccurrence } from "./next-occurrence";

async function readGiftSvgMarkup() {
  try {
    const giftSvgPath = path.join(process.cwd(), "src", "plugins", "birthdays", "assets", "gift.svg");
    return await readFile(giftSvgPath, "utf-8");
  } catch {
    return null;
  }
}

export default async function BirthdaysAdminPage() {
  const gate = await getBirthdaysPageData();

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver os aniversariantes." />;
  }

  const aesthetics = await resolveBrandAesthetics();
  const [result, appearanceResult, brandConfig, giftSvgMarkup] = await Promise.all([
    listBirthdays(),
    getBirthdayAppearance(),
    getBrandConfig(aesthetics.mode),
    readGiftSvgMarkup(),
  ]);

  if (!result.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aniversariantes: {result.error.message}</p>;
  }

  if (!appearanceResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aparência: {appearanceResult.error.message}</p>;
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

  const byMonthChartData: BirthdaysByMonthDatum[] = Object.entries(MONTH_LABELS).map(([month, label]) => ({
    month: label.slice(0, 3),
    total: (byMonth.get(Number(month)) ?? []).length,
  }));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Aniversariantes"
        description="Cadastro de aniversários por mês e dia — sem ano de nascimento."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/birthdays/appearance">Aparência</Link>
            </Button>
            <PrintBirthdaysDialog
              birthdays={birthdays}
              appearance={appearanceResult.data}
              brand={{
                mode: aesthetics.mode,
                logoUrl: brandConfig.logoUrl,
                name: brandConfig.siteName,
                color: aesthetics.color,
              }}
              giftSvgMarkup={giftSvgMarkup}
            />
            <ImportBirthdaysCsvDialog />
            {birthdays.length > 0 && <CreateBirthdayDialog />}
          </>
        }
      />

      {birthdays.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_2fr]">
          <AdminStatTile label="Total" value={birthdays.length} />
          <AdminStatTile label="Hoje" value={today.length} />
          <AdminStatTile label="Esta semana" value={thisWeek.length} />
          <Card size="sm" className="lg:row-span-1">
            <CardContent className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-caps text-muted-foreground">Por mês</p>
              <BirthdaysByMonthChart data={byMonthChartData} />
            </CardContent>
          </Card>
        </div>
      )}

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
