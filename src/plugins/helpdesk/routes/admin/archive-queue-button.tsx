"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { archiveQueueAction, type HelpdeskActionState } from "./actions";

const initialState: HelpdeskActionState = { error: null };

export function ArchiveQueueButton({ queueId, archived }: { queueId: string; archived: boolean }) {
  const [state, formAction, pending] = useActionState(archiveQueueAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: archived ? "Fila reativada." : "Fila arquivada.",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="queueId" value={queueId} />
      <input type="hidden" name="archived" value={archived ? "false" : "true"} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-muted-foreground">
        {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        {archived ? "Reativar" : "Arquivar"}
      </Button>
    </form>
  );
}
