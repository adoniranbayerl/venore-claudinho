import Link from "next/link";
import { listLogEntries } from "@/observability";
import { getDiagnosticsPageData } from "@/platform/admin-shell/get-diagnostics-page-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para ver os logs de observabilidade.</p>
      </div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const successFilter = parseSuccessFilter(resolvedSearchParams.success);

  const result = await listLogEntries({
    success: successFilter,
    useCase: resolvedSearchParams.useCase || undefined,
    cursor: resolvedSearchParams.cursor,
  });

  if (!result.success) {
    return <p className="text-sm text-destructive">Erro ao carregar logs: {result.error.message}</p>;
  }

  const { entries, hasMore } = result.data;
  const lastEntry = entries[entries.length - 1];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Diagnostics</h1>
        <p className="mt-1 text-sm text-text-secondary">Logs recentes de operações registradas pela camada de observabilidade.</p>
      </div>

      <section className="rounded border border-border-subtle bg-surface-panel p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="success" className="text-xs font-medium text-text-secondary">
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
            <label htmlFor="useCase" className="text-xs font-medium text-text-secondary">
              Use case
            </label>
            <input
              id="useCase"
              name="useCase"
              type="text"
              defaultValue={resolvedSearchParams.useCase ?? ""}
              placeholder="ex: cms.entries.publish"
              className="rounded border border-border-subtle px-2 py-1 text-sm text-text-primary"
            />
          </div>
          <button type="submit" className="rounded bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
            Filtrar
          </button>
        </form>
      </section>

      <section className="rounded border border-border-subtle bg-surface-panel p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs font-medium text-text-tertiary">
                <th className="py-2 pr-4">Horário</th>
                <th className="py-2 pr-4">Use case</th>
                <th className="py-2 pr-4">Ator</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Duração</th>
                <th className="py-2 pr-4">Erro</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border-subtle text-text-secondary">
                  <td className="py-2 pr-4 whitespace-nowrap">{entry.startedAt.toLocaleString("pt-BR")}</td>
                  <td className="py-2 pr-4">{entry.useCase}</td>
                  <td className="py-2 pr-4">
                    {entry.actorType}:{entry.actorId}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={entry.success ? "text-success" : "text-destructive"}>
                      {entry.success ? "sucesso" : "erro"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{entry.durationMs}ms</td>
                  <td className="py-2 pr-4 text-xs text-text-tertiary">
                    {entry.errorCode && (
                      <>
                        {entry.errorCode}
                        {entry.errorMessage && <>: {entry.errorMessage}</>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sm text-text-tertiary">
                    Nenhum log encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {hasMore && lastEntry && (
          <div className="mt-4 text-center">
            <Link
              href={buildLoadMoreHref(resolvedSearchParams, lastEntry.id)}
              className="text-sm font-medium text-text-primary hover:underline"
            >
              Carregar mais
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
