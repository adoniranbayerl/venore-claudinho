"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { createInstitutionAction, type EnrollmentDashboardActionState } from "./actions";
import { InstitutionFields } from "./institution-fields";

const initialState: EnrollmentDashboardActionState = { error: null };

export function CreateInstitutionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createInstitutionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Instituição criada.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <InstitutionFields />
      <Button type="submit" disabled={pending} className="w-full">
        Criar instituição
      </Button>
    </form>
  );
}
