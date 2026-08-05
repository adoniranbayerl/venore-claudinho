"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import { purgeMediaAction, type MediaTrashActionState } from "../actions";

const initialState: MediaTrashActionState = { error: null };

// Sem checagem de uso no client (diferente de DeleteMediaButton): purgeMediaSafely já reconfirma
// isso no servidor e nunca deixa forçar — se o arquivo voltou a ser referenciado, o toast de erro
// explica onde, sem opção de "apagar mesmo assim" (irreversível de verdade, ver purge-media-
// safely.ts).
export function PurgeMediaButton({ id, filename }: { id: string; filename: string }) {
  const [state, formAction, pending] = useActionState(purgeMediaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Arquivo apagado definitivamente." });

  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    setOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="id" value={id} />
      </form>
      <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => setOpen(true)}>
        Apagar definitivamente
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar &ldquo;{filename}&rdquo; definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita — o arquivo é removido do armazenamento de vez, não só da listagem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirm}>
              Apagar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
