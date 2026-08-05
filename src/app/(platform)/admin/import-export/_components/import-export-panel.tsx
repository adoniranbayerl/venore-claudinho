"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportReport, ImportReportOutcome } from "@/contexts/import-export";

const OUTCOME_LABEL: Record<ImportReportOutcome, string> = {
  created: "Criado",
  reused: "Reaproveitado",
  skipped: "Pulado",
  failed: "Falhou",
};

function badgeVariantForOutcome(outcome: ImportReportOutcome): "secondary" | "outline" | "destructive" {
  if (outcome === "failed") return "destructive";
  if (outcome === "created" || outcome === "reused") return "secondary";
  return "outline";
}

export function ImportExportPanel() {
  const [pending, setPending] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;
    if (!file) {
      toast.error("Selecione um arquivo .zip para importar.");
      return;
    }

    setPending(true);
    setReport(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/import-export/import", { method: "POST", body: formData });
      const body = (await response.json()) as { report?: ImportReport; error?: string };

      if (!response.ok || !body.report) {
        toast.error(body.error ?? "Falha ao importar o pacote.");
        return;
      }

      setReport(body.report);
      toast.success(
        `Importação concluída: ${body.report.createdCount} criado(s), ${body.report.reusedCount} reaproveitado(s), ${body.report.skippedCount} pulado(s), ${body.report.failedCount} falhou(aram).`,
      );
      form.reset();
    } catch {
      toast.error("Falha inesperada ao importar o pacote.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <h2 className="text-sm font-semibold text-foreground">Exportar</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Baixa um .zip com todo o conteúdo editorial (tags, categorias, conteúdos, menus) e a biblioteca de mídia inteira — para
          migrar este site para outra instalação do Venore.
        </p>
        <Button asChild className="mt-3">
          <a href="/api/import-export/export" download>
            Baixar exportação
          </a>
        </Button>
      </section>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <h2 className="text-sm font-semibold text-foreground">Importar</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Envie um .zip gerado pela exportação acima. Item já existente no destino (mesma key/slug, ou mesmo arquivo de mídia) é
          pulado — nada é sobrescrito.
        </p>
        <form onSubmit={handleImport} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            name="file"
            accept=".zip"
            required
            disabled={pending}
            className="rounded-sm text-sm text-muted-foreground outline-none ui-motion-base file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Importando..." : "Importar"}
          </Button>
        </form>
      </section>

      {report && (
        <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
          <h2 className="text-sm font-semibold text-foreground">Relatório da última importação</h2>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Detalhe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.lines.map((line, index) => (
                  <TableRow key={`${line.kind}-${line.ref}-${index}`}>
                    <TableCell className="text-xs text-muted-foreground">{line.kind}</TableCell>
                    <TableCell className="max-w-48 truncate text-xs" title={line.ref}>
                      {line.ref}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariantForOutcome(line.outcome)}>{OUTCOME_LABEL[line.outcome]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-96 text-xs text-wrap text-muted-foreground">{line.message ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
}
