"use client";

import { useActionState, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import { toggleThemeEnabledAction, type ThemesActionState } from "../actions";

const initialState: ThemesActionState = { error: null };

function ToggleForm({
  themeKey,
  enabled,
  label,
  variant,
  onSuccess,
}: {
  themeKey: string;
  enabled: boolean;
  label: string;
  variant: "outline" | "destructive";
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(toggleThemeEnabledAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: enabled ? "Tema habilitado." : "Tema desabilitado.",
    onSuccess,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="themeKey" value={themeKey} />
      <input type="hidden" name="enabled" value={String(enabled)} />
      <Button type="submit" variant={variant} size="sm" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}

export function ToggleThemeControl({
  themeKey,
  themeName,
  enabled,
  canDisable,
  disableBlockedReason,
}: {
  themeKey: string;
  themeName: string;
  enabled: boolean;
  canDisable: boolean;
  disableBlockedReason: string | null;
}) {
  const [open, setOpen] = useState(false);

  // Ajusta state durante a renderização em vez de useEffect (react-hooks/set-state-in-effect):
  // revalidatePath do
  // disable pode trazer enabled=false no mesmo commit em que o pending do ToggleForm de
  // confirmação vira false, desmontando esse ToggleForm antes do onSuccess (setOpen(false))
  // rodar — sem este ajuste, open fica preso em true e reabre sozinho ao reabilitar depois.
  const [prevEnabled, setPrevEnabled] = useState(enabled);
  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    if (!enabled) setOpen(false);
  }

  if (!enabled) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">Desabilitado</Badge>
        <ToggleForm themeKey={themeKey} enabled={true} label="Habilitar" variant="outline" />
      </div>
    );
  }

  if (!canDisable) {
    return (
      <div className="flex flex-col items-end gap-1 text-right">
        <Button type="button" variant="outline" size="sm" disabled>
          Desabilitar
        </Button>
        {disableBlockedReason && <p className="max-w-64 text-xs text-muted-foreground">{disableBlockedReason}</p>}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Desabilitar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desabilitar {themeName}?</DialogTitle>
          <DialogDescription>
            O tema deixa de aparecer na lista de seleção e não pode mais ser ativado até ser reabilitado. Código,
            configuração e o próprio tema permanecem intactos.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <ToggleForm themeKey={themeKey} enabled={false} label="Confirmar desabilitação" variant="destructive" onSuccess={() => setOpen(false)} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
