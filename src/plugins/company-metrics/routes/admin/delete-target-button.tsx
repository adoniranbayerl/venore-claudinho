"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteTargetAction, type CompanyMetricsActionState } from "./actions";

const initialState: CompanyMetricsActionState = { error: null };

export function DeleteTargetButton({ targetId }: { targetId: string }) {
  const [state, formAction, pending] = useActionState(deleteTargetAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Meta removida." });

  return (
    <form action={formAction}>
      <input type="hidden" name="targetId" value={targetId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-muted-foreground">
        <Trash2 className="size-4" />
        Remover
      </Button>
    </form>
  );
}
