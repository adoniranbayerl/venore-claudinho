"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TARGET_CLASSIFICATIONS, type TargetClassification } from "@/plugins/company-metrics/contracts/types";

export type DefinitionOption = { id: string; label: string };
export type CompositionLine = { definitionId: string; weight: number; classification: TargetClassification };

const CLASSIFICATION_LABELS: Record<TargetClassification, string> = {
  realized: "Conta como realizado",
  at_risk: "Em risco (só na leitura otimista)",
  projected: "Projeção (só na leitura otimista)",
  subtract: "Abate do total",
};

// Construtor de meta: campos principais + composição (métrica × peso × classificação). A
// composição é serializada num input hidden (compositionJson) — a action parseia. Sem fórmula
// escrita à mão, sem UUID digitado.
export function TargetBuilder({
  definitions,
  defaultLabel = "",
  defaultDescription = "",
  defaultTargetValue = "",
  defaultPeriodStart = "",
  defaultPeriodEnd = "",
  defaultThreshold = "0.85",
  defaultComposition = [],
  submitLabel,
  pending,
}: {
  definitions: DefinitionOption[];
  defaultLabel?: string;
  defaultDescription?: string;
  defaultTargetValue?: number | string;
  defaultPeriodStart?: string;
  defaultPeriodEnd?: string;
  defaultThreshold?: number | string;
  defaultComposition?: CompositionLine[];
  submitLabel: string;
  pending: boolean;
}) {
  const [lines, setLines] = useState<CompositionLine[]>(
    defaultComposition.length > 0 ? defaultComposition : [],
  );

  const used = new Set(lines.map((line) => line.definitionId));
  const available = definitions.filter((definition) => !used.has(definition.id));

  function addLine() {
    if (available.length === 0) return;
    setLines((current) => [...current, { definitionId: available[0].id, weight: 1, classification: "realized" }]);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="compositionJson" value={JSON.stringify(lines)} />

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome da meta
        <Input name="label" defaultValue={defaultLabel} placeholder="ex.: Entradas 2026/2" required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Descrição (opcional)
        <Textarea name="description" defaultValue={defaultDescription} rows={2} />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Valor da meta
          <Input name="targetValue" inputMode="decimal" defaultValue={defaultTargetValue} placeholder="300" required />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Limiar “no ritmo” (0 a 1)
          <Input name="onTrackThreshold" inputMode="decimal" defaultValue={String(defaultThreshold)} placeholder="0,85" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Início do período
          <Input type="date" name="periodStart" defaultValue={defaultPeriodStart} required />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Fim do período
          <Input type="date" name="periodEnd" defaultValue={defaultPeriodEnd} required />
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-border p-3">
        <p className="text-sm font-medium text-foreground">Composição da meta</p>
        <p className="text-xs text-muted-foreground/56">
          Quais métricas somam contra esta meta e como cada uma conta.
        </p>

        {lines.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma métrica adicionada.</p>}

        {lines.map((line, index) => (
          <div key={index} className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Métrica
              <Select
                value={line.definitionId}
                onValueChange={(value) =>
                  setLines((current) => current.map((entry, i) => (i === index ? { ...entry, definitionId: value } : entry)))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {definitions
                    .filter((definition) => definition.id === line.definitionId || !used.has(definition.id))
                    .map((definition) => (
                      <SelectItem key={definition.id} value={definition.id}>
                        {definition.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>

            <label className="flex w-20 flex-col gap-1 text-xs text-muted-foreground">
              Peso
              <Input
                inputMode="decimal"
                value={line.weight}
                onChange={(event) =>
                  setLines((current) =>
                    current.map((entry, i) => (i === index ? { ...entry, weight: Number(event.target.value.replace(",", ".")) } : entry)),
                  )
                }
              />
            </label>

            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Como conta
              <Select
                value={line.classification}
                onValueChange={(value) =>
                  setLines((current) =>
                    current.map((entry, i) => (i === index ? { ...entry, classification: value as TargetClassification } : entry)),
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_CLASSIFICATIONS.map((classification) => (
                    <SelectItem key={classification} value={classification}>
                      {CLASSIFICATION_LABELS[classification]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
              aria-label="Remover métrica"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="secondary" size="sm" onClick={addLine} disabled={available.length === 0}>
          <Plus className="size-4" />
          Adicionar métrica
        </Button>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
