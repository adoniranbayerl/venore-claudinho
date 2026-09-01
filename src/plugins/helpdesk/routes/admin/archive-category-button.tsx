"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { archiveCategoryAction, type HelpdeskActionState } from "./actions";

const initialState: HelpdeskActionState = { error: null };

export function ArchiveCategoryButton({ categoryId, archived }: { categoryId: string; archived: boolean }) {
  const [state, formAction, pending] = useActionState(archiveCategoryAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: archived ? "Categoria reativada." : "Categoria arquivada.",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="archived" value={archived ? "false" : "true"} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={pending}
        className="text-muted-foreground"
        aria-label={archived ? "Reativar categoria" : "Arquivar categoria"}
      >
        {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
      </Button>
    </form>
  );
}
