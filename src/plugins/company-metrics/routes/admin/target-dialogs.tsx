"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import type { TargetInputRecord, TargetRecord } from "@/plugins/company-metrics/contracts/types";
import { createTargetAction, updateTargetAction, type CompanyMetricsActionState } from "./actions";
import { TargetBuilder, type CompositionLine, type DefinitionOption } from "./target-builder";

const initialState: CompanyMetricsActionState = { error: null };

export function CreateTargetDialog({ sectorId, definitions }: { sectorId: string; definitions: DefinitionOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTargetAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Meta criada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Nova meta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova meta</DialogTitle>
          <DialogDescription>Defina o alvo, o período e quais métricas somam contra ele.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="sectorId" value={sectorId} />
          <TargetBuilder definitions={definitions} submitLabel="Criar meta" pending={pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTargetDialog({
  target,
  inputs,
  definitions,
}: {
  target: TargetRecord;
  inputs: TargetInputRecord[];
  definitions: DefinitionOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateTargetAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Meta atualizada.", onSuccess: () => setOpen(false) });

  const composition: CompositionLine[] = inputs.map((input) => ({
    definitionId: input.definitionId,
    weight: input.weight,
    classification: input.classification,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar {target.label}</DialogTitle>
        </DialogHeader>
        <form action={formAction} key={`${target.id}:${String(target.updatedAt)}`}>
          <input type="hidden" name="targetId" value={target.id} />
          <TargetBuilder
            definitions={definitions}
            defaultLabel={target.label}
            defaultDescription={target.description ?? ""}
            defaultTargetValue={target.targetValue}
            defaultPeriodStart={target.periodStart}
            defaultPeriodEnd={target.periodEnd}
            defaultThreshold={target.onTrackThreshold}
            defaultComposition={composition}
            submitLabel="Salvar meta"
            pending={pending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
