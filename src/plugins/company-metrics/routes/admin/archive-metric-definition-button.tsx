"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { archiveMetricDefinitionAction, type CompanyMetricsActionState } from "./actions";

const initialState: CompanyMetricsActionState = { error: null };

export function ArchiveMetricDefinitionButton({ definitionId, archived }: { definitionId: string; archived: boolean }) {
  const [state, formAction, pending] = useActionState(archiveMetricDefinitionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: archived ? "Métrica reativada." : "Métrica arquivada." });

  return (
    <form action={formAction}>
      <input type="hidden" name="definitionId" value={definitionId} />
      <input type="hidden" name="archived" value={archived ? "false" : "true"} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-muted-foreground">
        {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        {archived ? "Reativar" : "Arquivar"}
      </Button>
    </form>
  );
}
