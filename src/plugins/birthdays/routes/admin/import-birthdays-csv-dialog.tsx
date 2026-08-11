"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Import direto do módulo folha (não do barrel @/plugins/birthdays) — mesmo motivo de
// birthday-fields.tsx: este componente roda no browser e o barrel reexporta handlers que
// arrastam @/infrastructure/database/client (pg).
import { MONTH_LABELS } from "@/plugins/birthdays/shared/months";
import { importBirthdaysCsvAction, previewBirthdaysCsvImportAction } from "./actions";
import {
  birthdaysCsvImportInitialPreviewState,
  birthdaysCsvImportInitialState,
  type ImportBirthdaysCsvActionState,
  type PreviewBirthdaysCsvImportState,
} from "./initial-state";

export function ImportBirthdaysCsvDialog() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewBirthdaysCsvImportState>(birthdaysCsvImportInitialPreviewState());
  const [outcomeState, setOutcomeState] = useState<ImportBirthdaysCsvActionState>(birthdaysCsvImportInitialState());
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [isPreviewing, startPreviewTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setSelectedFile(null);
    setPreview(birthdaysCsvImportInitialPreviewState());
    setOutcomeState(birthdaysCsvImportInitialState());
    setIncludeDuplicates(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
    setPreview(birthdaysCsvImportInitialPreviewState());
    setOutcomeState(birthdaysCsvImportInitialState());
  }

  function handlePreview() {
    if (!selectedFile) {
      toast.error("Selecione um arquivo .csv para importar.");
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);

    startPreviewTransition(async () => {
      const result = await previewBirthdaysCsvImportAction(birthdaysCsvImportInitialPreviewState(), formData);
      setPreview(result);
      if (result.error) toast.error(result.error);
    });
  }

  function handleConfirm() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("includeDuplicates", includeDuplicates ? "true" : "false");

    startImportTransition(async () => {
      const result = await importBirthdaysCsvAction(birthdaysCsvImportInitialState(), formData);
      setOutcomeState(result);
      if (result.error) {
        toast.error(result.error);
      } else if (result.outcome) {
        toast.success(`${result.outcome.insertedCount} aniversariante(s) importado(s).`);
      }
    });
  }

  const report = preview.report;
  const outcome = outcomeState.outcome;
  const importableCount = report ? (includeDuplicates ? report.validCount + report.duplicateCount : report.validCount) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar aniversariantes por CSV</DialogTitle>
          <DialogDescription>
            Colunas: Nome completo, Mês e Dia (obrigatórias); Cargo e Localidade (opcionais). Aceita vírgula ou
            ponto-e-vírgula como separador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* <a> nativa de propósito, não next/link: a rota é um download de arquivo (Content-
              Disposition: attachment), não uma página — deixar o Link fazer soft navigation pra
              ela troca a URL da página para /api/birthdays/import-template, e as Server Actions
              de preview/import passam a fazer POST lá (405, só aceita GET) em vez de voltar pra
              /admin/birthdays. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- rota de download de arquivo, não uma página */}
          <a
            href="/api/birthdays/import-template"
            className="inline-flex w-fit items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            <Download className="size-3.5" />
            Baixar modelo .csv
          </a>

          {!outcome && (
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
              />
              <Button type="button" onClick={handlePreview} disabled={!selectedFile || isPreviewing}>
                {isPreviewing ? "Analisando..." : "Pré-visualizar"}
              </Button>
            </div>
          )}

          {report && !outcome && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">{report.totalRows} linha(s)</Badge>
                <Badge variant="secondary">{report.validCount} válida(s)</Badge>
                {report.duplicateCount > 0 && <Badge variant="outline">{report.duplicateCount} duplicada(s)</Badge>}
                {report.errorCount > 0 && <Badge variant="destructive">{report.errorCount} com erro</Badge>}
              </div>

              <div className="max-h-72 overflow-y-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nome / erro</TableHead>
                      <TableHead>Nascimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.rows.map((row) => (
                      <TableRow
                        key={row.lineNumber}
                        className={
                          row.status === "error"
                            ? "bg-destructive/5"
                            : row.status === "duplicate"
                              ? "bg-muted/50"
                              : undefined
                        }
                      >
                        <TableCell>{row.lineNumber}</TableCell>
                        <TableCell>
                          {row.status === "valid" && <Badge variant="secondary">válida</Badge>}
                          {row.status === "duplicate" && <Badge variant="outline">duplicata</Badge>}
                          {row.status === "error" && <Badge variant="destructive">erro</Badge>}
                        </TableCell>
                        <TableCell>
                          {row.status === "error" ? (
                            <span className="text-destructive">{row.errorMessage}</span>
                          ) : (
                            row.fullName
                          )}
                        </TableCell>
                        <TableCell>
                          {row.status !== "error" ? `${row.day} de ${MONTH_LABELS[row.month]}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {report.duplicateCount > 0 && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={includeDuplicates}
                    onChange={(event) => setIncludeDuplicates(event.target.checked)}
                    className="size-4 rounded-sm border-border outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  Importar duplicatas mesmo assim
                </label>
              )}

              <Button type="button" onClick={handleConfirm} disabled={importableCount === 0 || isImporting} className="w-full">
                {isImporting ? "Importando..." : `Confirmar importação (${importableCount} linha(s))`}
              </Button>
            </div>
          )}

          {outcome && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">{outcome.insertedCount} importado(s)</Badge>
                {outcome.skippedDuplicateCount > 0 && (
                  <Badge variant="outline">{outcome.skippedDuplicateCount} duplicata(s) ignorada(s)</Badge>
                )}
                {outcome.skippedErrorCount > 0 && (
                  <Badge variant="destructive">{outcome.skippedErrorCount} ignorada(s) por erro</Badge>
                )}
              </div>

              {outcome.skipped.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-md border border-border p-3 text-sm text-muted-foreground">
                  {outcome.skipped.map((row) => (
                    <p key={row.lineNumber}>{row.reason}</p>
                  ))}
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Concluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
