"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import type { PaletteColorTokens } from "@/contexts/themes";
import { updateCustomColorPaletteAction, type ThemesActionState } from "../actions";

const initialState: ThemesActionState = { error: null };

const FIELDS: { token: "primary" | "secondary" | "background" | "foreground"; label: string }[] = [
  { token: "primary", label: "Primária" },
  { token: "secondary", label: "Secundária" },
  { token: "background", label: "Fundo" },
  { token: "foreground", label: "Texto" },
];

// input type=color só aceita/produz #rrggbb — por isso o fallback abaixo (quando o admin nunca
// salvou um valor pra esse token) precisa ser um hex fixo, não a var() do tema ativo (que pode
// ser oklch, formato que o picker nativo do navegador não entende).
const UNSET_FALLBACK = "#000000";

function ColorModeFields({ mode, label, tokens }: { mode: "light" | "dark"; label: string; tokens: PaletteColorTokens }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-caps text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIELDS.map(({ token, label: fieldLabel }) => (
          <label key={token} className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <input
              type="color"
              name={`${mode}-${token}`}
              defaultValue={tokens[token] ?? UNSET_FALLBACK}
              className="h-9 w-full cursor-pointer rounded-md border border-border bg-transparent outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
            />
            {fieldLabel}
          </label>
        ))}
      </div>
    </div>
  );
}

export function CustomColorPaletteForm({ light, dark }: { light: PaletteColorTokens; dark: PaletteColorTokens }) {
  const [state, formAction, pending] = useActionState(updateCustomColorPaletteAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cores personalizadas salvas e aplicadas." });

  return (
    <form action={formAction} className="mt-4 space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Cores personalizadas</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Sobrescreve primary/secondary/background/text do tema ativo com valores próprios. Salvar aplica
          automaticamente — não precisa clicar em &quot;Usar&quot; na lista acima.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorModeFields mode="light" label="Modo claro" tokens={light} />
        <ColorModeFields mode="dark" label="Modo escuro" tokens={dark} />
      </div>

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salvar e aplicar
      </Button>
    </form>
  );
}
