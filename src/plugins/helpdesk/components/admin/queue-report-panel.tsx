import { EmptyState } from "@/components/empty-state";
import { formatSlaMinutes } from "@/plugins/helpdesk/shared/sla-display";
import type { QueueReport } from "@/plugins/helpdesk";

// Aba `Relatório` do /admin/helpdesk (docs/chamados-plugin.md §7). Server component, só leitura:
// uma linha por fila com abertos, % de SLA cumprido, tempo médio de resolução e nota média. Sem
// cor crua — token shadcn; `text-warning`/`text-destructive` sinalizam SLA baixo. Mobile-first: a
// tabela rola dentro do próprio container em telas estreitas.
export function QueueReportPanel({ report }: { report: QueueReport }) {
  if (report.rows.length === 0) {
    return (
      <EmptyState
        title="Nenhuma fila para relatar"
        description="Crie uma fila na aba Filas & SLA para começar a acompanhar os números."
      />
    );
  }

  const generatedAt = new Date(report.generatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Números de todo o histórico · gerado em {generatedAt}</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Fila</th>
              <th className="px-4 py-2.5 text-right font-medium">Abertos</th>
              <th className="px-4 py-2.5 text-right font-medium">SLA cumprido</th>
              <th className="px-4 py-2.5 text-right font-medium">Tempo médio</th>
              <th className="px-4 py-2.5 text-right font-medium">Nota média</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {report.rows.map((row) => (
              <tr key={row.queueId}>
                <td className="px-4 py-2.5 font-medium text-foreground">{row.queueName}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{row.openCount}</td>
                <td className={`px-4 py-2.5 text-right tabular-nums ${slaClass(row.slaMetPct)}`}>
                  {row.slaMetPct === null ? "—" : `${row.slaMetPct}%`}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                  {row.avgResolutionMinutes === null ? "—" : formatSlaMinutes(Math.round(row.avgResolutionMinutes))}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                  {row.avgRating === null ? "—" : `${row.avgRating.toFixed(1)} (${row.ratedCount})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        &ldquo;SLA cumprido&rdquo; considera só os chamados resolvidos que tinham prazo. &ldquo;Nota média&rdquo; mostra a
        média e, entre parênteses, quantos chamados foram avaliados.
      </p>
    </div>
  );
}

// Realce quando o cumprimento de SLA está baixo — mesma paleta do realce de SLA nas listas.
function slaClass(pct: number | null): string {
  if (pct === null) return "text-muted-foreground";
  if (pct < 60) return "text-destructive";
  if (pct < 85) return "text-warning";
  return "text-foreground";
}
