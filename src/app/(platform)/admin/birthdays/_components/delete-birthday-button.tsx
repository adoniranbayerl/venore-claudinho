"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteBirthdayAction, type BirthdaysActionState } from "../actions";

const initialState: BirthdaysActionState = { error: null };

export function DeleteBirthdayButton({ birthdayId, fullName }: { birthdayId: string; fullName: string }) {
  const [state, formAction, pending] = useActionState(deleteBirthdayAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: `${fullName} removido.` });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remover ${fullName} do cadastro de aniversariantes?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="birthdayId" value={birthdayId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label={`Remover ${fullName}`}>
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
