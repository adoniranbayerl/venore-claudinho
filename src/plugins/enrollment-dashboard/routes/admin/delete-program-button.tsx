"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteProgramAction, type EnrollmentDashboardActionState } from "./actions";

const initialState: EnrollmentDashboardActionState = { error: null };

export function DeleteProgramButton({ programId, label }: { programId: string; label: string }) {
  const [state, formAction, pending] = useActionState(deleteProgramAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: `${label} removido.` });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remover "${label}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="programId" value={programId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label={`Remover ${label}`}>
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
