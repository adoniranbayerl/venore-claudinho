import Link from "next/link";
import { listLogEntries } from "@/observability";
import { getDiagnosticsPageData } from "@/platform/admin-shell/get-diagnostics-page-data";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchX } from "lucide-react";

type DiagnosticsSearchParams = {
  success?: string;
  useCase?: string;
  cursor?: string;
};

function parseSuccessFilter(value: string | undefined): boolean | undefined {
  if (value === "success") return true;
  if (value === "error") return false;
  return undefined;
}

function buildLoadMoreHref(searchParams: DiagnosticsSearchParams, cursor: string): string {
  const params = new URLSearchParams();
  if (searchParams.success) params.set("success", searchParams.success);
  if (searchParams.useCase) params.set("useCase", searchParams.useCase);
  params.set("cursor", cursor);
  return `/admin/diagnostics?${params.toString()}`;
}

export default async function DiagnosticsAdminPage({
  searchParams,
}: {
  searchParams: Promise<DiagnosticsSearchParams>;
}) {
  const gate = await getDiagnosticsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para ver o diagnóstico do sistema.</p>
      </div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const successFilter = parseSuccessFilter(resolvedSearchParams.success);
  const hasFilter = Boolean(resolvedSearchParams.success || resolvedSearchParams.useCase);

  const result = await listLogEntries({
    success: successFilter,
    useCase: resolvedSearchParams.useCase || undefined,
    cursor: resolvedSearchParams.cursor,
  });

  if (!result.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar o diagnóstico agora. Tente recarregar a página.</p>;
  }

  const { entries, hasMore } = result.data;
  const lastEntry = entries[entries.length - 1];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Diagnóstico</h1>
        <p className="mt-1 text-sm text-muted-foreground">Registro técnico das operações executadas pelo sistema — use para investigar falhas.</p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="success" className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select name="success" defaultValue={resolvedSearchParams.success ?? "all"}>
              <SelectTrigger id="success" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Só sucesso</SelectItem>
                <SelectItem value="error">Só erros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="useCase" className="text-xs font-medium text-muted-foreground">
              Ação do sistema
            </label>
            <Input
              id="useCase"
              name="useCase"
              type="text"
              defaultValue={resolvedSearchParams.useCase ?? ""}
              placeholder="ex: cms.entries.publish"
            />
          </div>
          <Button type="submit">Filtrar</Button>
        </form>
      </section>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        {entries.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-8" strokeWidth={1.5} />}
            title="Nenhum registro encontrado"
            description={
              hasFilter
                ? "Nenhuma operação bate com os filtros escolhidos. Tente limpar o filtro de status ou de ação."
                : "Ainda não há operações registradas — elas aparecem aqui assim que o sistema processar alguma ação."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground/56">
                    <th className="py-2 pr-4">Horário</th>
                    <th className="py-2 pr-4">Ação do sistema</th>
                    <th className="py-2 pr-4">Ator</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Duração</th>
                    <th className="py-2 pr-4">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border text-muted-foreground">
                      <td className="py-2 pr-4 whitespace-nowrap">{entry.startedAt.toLocaleString("pt-BR")}</td>
                      <td className="py-2 pr-4">{entry.useCase}</td>
                      <td className="py-2 pr-4">
                        {entry.actorType}:{entry.actorId}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={entry.success ? "text-primary" : "text-destructive"}>
                          {entry.success ? "sucesso" : "erro"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{entry.durationMs}ms</td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground/56">
                        {entry.errorCode && (
                          <>
                            {entry.errorCode}
                            {entry.errorMessage && <>: {entry.errorMessage}</>}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && lastEntry && (
              <div className="mt-4 text-center">
                <Link
                  href={buildLoadMoreHref(resolvedSearchParams, lastEntry.id)}
                  className="rounded-sm text-sm font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Carregar mais
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
