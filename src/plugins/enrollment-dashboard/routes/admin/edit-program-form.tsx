"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import type { EnrollmentProgramMetrics } from "@/plugins/enrollment-dashboard";
import { updateProgramAction, type EnrollmentDashboardActionState } from "./actions";
import { ProgramFields } from "./program-fields";

const initialState: EnrollmentDashboardActionState = { error: null };

export function EditProgramForm({
  program,
  programLabel,
  onSuccess,
}: {
  program: EnrollmentProgramMetrics;
  programLabel: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateProgramAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Atualizado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="programId" value={program.id} />
      <ProgramFields
        programLabel={programLabel}
        defaultLabel={program.label}
        defaultGroupLabel={program.group ?? ""}
        defaultGoal={program.goal}
        defaultRenewed={program.renewed}
        defaultNewEnrollments={program.newEnrollments}
      />
      <Button type="submit" disabled={pending} className="w-full">
        Salvar alterações
      </Button>
    </form>
  );
}
