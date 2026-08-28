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
import type { MetricDefinitionRecord } from "@/plugins/company-metrics/contracts/types";
import {
  createMetricDefinitionAction,
  updateMetricDefinitionAction,
  type CompanyMetricsActionState,
} from "./actions";
import { MetricDefinitionFields } from "./metric-definition-fields";

const initialState: CompanyMetricsActionState = { error: null };

type GroupOption = { id: string; label: string };

export function CreateMetricDefinitionDialog({ sectorId, groups }: { sectorId: string; groups: GroupOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createMetricDefinitionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Métrica criada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Nova métrica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova métrica</DialogTitle>
          <DialogDescription>A cadência define o período de lançamento e não muda depois de criada.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="sectorId" value={sectorId} />
          <MetricDefinitionFields groups={groups} />
          <Button type="submit" disabled={pending} className="w-full">
            Criar métrica
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditMetricDefinitionDialog({
  definition,
  groups,
}: {
  definition: MetricDefinitionRecord;
  groups: GroupOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateMetricDefinitionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Métrica atualizada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar {definition.label}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3" key={`${definition.id}:${String(definition.updatedAt)}`}>
          <input type="hidden" name="definitionId" value={definition.id} />
          <MetricDefinitionFields
            groups={groups}
            defaultLabel={definition.label}
            defaultDescription={definition.description ?? ""}
            defaultGroupId={definition.groupId ?? ""}
            defaultUnit={definition.unit}
            defaultAggregation={definition.aggregation}
            defaultGranularity={definition.granularity}
            defaultDirection={definition.direction}
            lockGranularity
          />
          <Button type="submit" disabled={pending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
