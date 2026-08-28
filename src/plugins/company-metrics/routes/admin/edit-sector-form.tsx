"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import type { SectorRecord } from "@/plugins/company-metrics/contracts/types";
import { updateSectorAction, type CompanyMetricsActionState } from "./actions";
import { SectorFields } from "./sector-fields";

const initialState: CompanyMetricsActionState = { error: null };

export function EditSectorForm({ sector, onSuccess }: { sector: SectorRecord; onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(updateSectorAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Setor atualizado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sectorId" value={sector.id} />
      <SectorFields
        defaultName={sector.name}
        defaultDescription={sector.description ?? ""}
        defaultIcon={sector.icon ?? ""}
      />
      <Button type="submit" disabled={pending} className="w-full">
        Salvar
      </Button>
    </form>
  );
}
