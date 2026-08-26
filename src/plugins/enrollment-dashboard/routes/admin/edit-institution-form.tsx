"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { useActionToast } from "@/hooks/use-action-toast";
import type { EnrollmentInstitution } from "@/plugins/enrollment-dashboard";
import { updateInstitutionAction, type EnrollmentDashboardActionState } from "./actions";
import { InstitutionFields } from "./institution-fields";

const initialState: EnrollmentDashboardActionState = { error: null };

export function EditInstitutionForm({
  institution,
  logo,
  onSuccess,
}: {
  institution: EnrollmentInstitution;
  logo: PickableMedia | null;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateInstitutionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Instituição atualizada.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="institutionId" value={institution.id} />
      <InstitutionFields defaultName={institution.name} defaultProgramLabel={institution.programLabel} initialLogo={logo} />
      <Button type="submit" disabled={pending} className="w-full">
        Salvar alterações
      </Button>
    </form>
  );
}
