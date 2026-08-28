"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { createSectorAction, type CompanyMetricsActionState } from "./actions";
import { SectorFields } from "./sector-fields";

const initialState: CompanyMetricsActionState = { error: null };

export function CreateSectorForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createSectorAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Setor criado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <SectorFields />
      <Button type="submit" disabled={pending} className="w-full">
        Criar setor
      </Button>
    </form>
  );
}
