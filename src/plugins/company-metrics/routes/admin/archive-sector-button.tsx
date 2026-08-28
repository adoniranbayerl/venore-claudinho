"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { archiveSectorAction, type CompanyMetricsActionState } from "./actions";

const initialState: CompanyMetricsActionState = { error: null };

export function ArchiveSectorButton({ sectorId, archived }: { sectorId: string; archived: boolean }) {
  const [state, formAction, pending] = useActionState(archiveSectorAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: archived ? "Setor reativado." : "Setor arquivado.",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="sectorId" value={sectorId} />
      <input type="hidden" name="archived" value={archived ? "false" : "true"} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-muted-foreground">
        {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        {archived ? "Reativar" : "Arquivar"}
      </Button>
    </form>
  );
}
