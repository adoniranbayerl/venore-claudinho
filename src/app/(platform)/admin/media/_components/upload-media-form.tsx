"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { uploadMediaAction, type MediaActionState } from "../actions";

const initialState: MediaActionState = { error: null };

export function UploadMediaForm() {
  const [state, formAction, pending] = useActionState(uploadMediaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Arquivo enviado." });

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input
        type="file"
        name="file"
        required
        className="rounded-sm text-sm text-muted-foreground outline-none ui-motion-base file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
