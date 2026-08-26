"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { createProgramAction, type EnrollmentDashboardActionState } from "./actions";
import { ProgramFields } from "./program-fields";

const initialState: EnrollmentDashboardActionState = { error: null };

export function CreateProgramForm({
  institutionId,
  programLabel,
  onSuccess,
}: {
  institutionId: string;
  programLabel: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(createProgramAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cadastrado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="institutionId" value={institutionId} />
      <ProgramFields programLabel={programLabel} />
      <Button type="submit" disabled={pending} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
