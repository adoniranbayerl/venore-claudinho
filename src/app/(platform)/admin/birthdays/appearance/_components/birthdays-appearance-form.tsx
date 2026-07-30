"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
// Import direto do módulo folha (não do barrel @/plugins/birthdays) — mesmo motivo de
// birthday-fields.tsx: client component não pode arrastar @/infrastructure/database/client (pg)
// pelos handlers reexportados no barrel.
import { BIRTHDAY_APPEARANCE_SETTINGS, type BirthdayAppearanceSettings } from "@/plugins/birthdays/shared/appearance";
import { updateBirthdaysAppearanceAction, type BirthdaysAppearanceActionState } from "../actions";

const initialState: BirthdaysAppearanceActionState = { error: null };

export function BirthdaysAppearanceForm({ appearance }: { appearance: BirthdayAppearanceSettings }) {
  const [state, formAction, pending] = useActionState(updateBirthdaysAppearanceAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Aparência dos aniversariantes salva." });

  return (
    <form action={formAction} className="grid gap-3 rounded-panel border border-border bg-card ui-panel-padding-roomy sm:grid-cols-2">
      {Object.entries(BIRTHDAY_APPEARANCE_SETTINGS).map(([field, { label }]) => (
        <label key={field} className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          {label}
          <input
            type="color"
            name={field}
            defaultValue={appearance[field as keyof BirthdayAppearanceSettings]}
            className="h-9 w-16 cursor-pointer rounded-md border border-border bg-transparent outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      ))}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        Salvar aparência
      </Button>
    </form>
  );
}
