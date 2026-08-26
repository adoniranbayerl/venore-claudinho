"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteInstitutionAction, type EnrollmentDashboardActionState } from "./actions";

const initialState: EnrollmentDashboardActionState = { error: null };

export function DeleteInstitutionButton({ institutionId, name }: { institutionId: string; name: string }) {
  const [state, formAction, pending] = useActionState(deleteInstitutionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: `${name} removida.` });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remover "${name}"? Todas as turmas/cursos dela também serão removidos.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="institutionId" value={institutionId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label={`Remover ${name}`}>
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
