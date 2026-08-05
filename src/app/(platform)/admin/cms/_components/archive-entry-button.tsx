"use client";

import { useActionState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { archiveEntryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function ArchiveEntryButton({ entryId }: { entryId: string }) {
  const [state, formAction, pending] = useActionState(archiveEntryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Conteúdo arquivado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={entryId} />
      <Button type="submit" variant="link" size="sm" disabled={pending} className="h-auto p-0 text-xs">
        <Archive className="size-3" /> Arquivar
      </Button>
    </form>
  );
}
