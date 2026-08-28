"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { TV_SCREEN_KINDS, type TvScreenKind } from "@/plugins/company-metrics/contracts/types";
import { setTvScreensAction, type CompanyMetricsActionState } from "./actions";

const initialState: CompanyMetricsActionState = { error: null };

const KIND_LABELS: Record<TvScreenKind, string> = {
  overview: "Panorama — todos os setores",
  sector_kpis: "Métricas de um setor",
  target_board: "Painel de uma meta",
};

type ScreenLine = { kind: TvScreenKind; sectorId: string | null; targetId: string | null; dwellSeconds: number };

export function TvBoardEditor({
  boardId,
  sectors,
  targets,
  initialScreens,
}: {
  boardId: string;
  sectors: { id: string; name: string }[];
  targets: { id: string; label: string; sectorName: string }[];
  initialScreens: ScreenLine[];
}) {
  const [screens, setScreens] = useState<ScreenLine[]>(initialScreens);
  const [state, formAction, pending] = useActionState(setTvScreensAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Telas salvas." });

  function addScreen() {
    setScreens((current) => [...current, { kind: "overview", sectorId: null, targetId: null, dwellSeconds: 20 }]);
  }

  function patch(index: number, next: Partial<ScreenLine>) {
    setScreens((current) => current.map((line, i) => (i === index ? { ...line, ...next } : line)));
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="screensJson" value={JSON.stringify(screens)} />

      {screens.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tela — o painel fica vazio na TV.</p>}

      {screens.map((line, index) => (
        <div key={index} className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            Tipo
            <Select value={line.kind} onValueChange={(value) => patch(index, { kind: value as TvScreenKind, sectorId: null, targetId: null })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TV_SCREEN_KINDS.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {KIND_LABELS[kind]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {line.kind === "sector_kpis" && (
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Setor
              <Select value={line.sectorId ?? ""} onValueChange={(value) => patch(index, { sectorId: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}

          {line.kind === "target_board" && (
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Meta
              <Select value={line.targetId ?? ""} onValueChange={(value) => patch(index, { targetId: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.sectorName} · {target.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}

          <label className="flex w-24 flex-col gap-1 text-xs text-muted-foreground">
            Segundos
            <Input
              inputMode="numeric"
              value={line.dwellSeconds}
              onChange={(event) => patch(index, { dwellSeconds: Number(event.target.value) || 0 })}
            />
          </label>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setScreens((current) => current.filter((_, i) => i !== index))}
            aria-label="Remover tela"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={addScreen}>
          <Plus className="size-4" />
          Adicionar tela
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          Salvar telas
        </Button>
      </div>
    </form>
  );
}
