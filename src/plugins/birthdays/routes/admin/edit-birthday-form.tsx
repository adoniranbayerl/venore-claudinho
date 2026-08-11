"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateBirthdayAction, type BirthdaysActionState } from "./actions";
import { BirthdayFields } from "./birthday-fields";
import type { BirthdayAdminView } from "@/plugins/birthdays";

const initialState: BirthdaysActionState = { error: null };

export function EditBirthdayForm({ birthday, onSuccess }: { birthday: BirthdayAdminView; onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(updateBirthdayAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Aniversariante atualizado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="birthdayId" value={birthday.id} />
      <BirthdayFields
        defaultFullName={birthday.fullName}
        defaultRole={birthday.role ?? ""}
        defaultLocality={birthday.locality}
        defaultMonth={birthday.month}
        defaultDay={birthday.day}
      />
      <Button type="submit" disabled={pending} className="w-full">
        Salvar alterações
      </Button>
    </form>
  );
}
