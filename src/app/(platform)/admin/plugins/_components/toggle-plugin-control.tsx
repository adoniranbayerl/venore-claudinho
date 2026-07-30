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
import { togglePluginEnabledAction, type PluginsActionState } from "../actions";

const initialState: PluginsActionState = { error: null };

export type PluginDisableConsequences = {
  navigationLabels: string[];
  permissionLabels: string[];
  affectedUserCount: number;
  blockedByDependents: { key: string; name: string }[];
};

function ToggleForm({
  pluginKey,
  enabled,
  label,
  variant,
  onSuccess,
}: {
  pluginKey: string;
  enabled: boolean;
  label: string;
  variant: "outline" | "destructive";
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(togglePluginEnabledAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: enabled ? "Plugin habilitado." : "Plugin desabilitado.",
    onSuccess,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="pluginKey" value={pluginKey} />
      <input type="hidden" name="enabled" value={String(enabled)} />
      <Button type="submit" variant={variant} size="sm" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}

export function TogglePluginControl({
  pluginKey,
  pluginName,
  enabled,
  consequences,
}: {
  pluginKey: string;
  pluginName: string;
  enabled: boolean;
  consequences: PluginDisableConsequences;
}) {
  const [open, setOpen] = useState(false);

  if (!enabled) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">Desabilitado</Badge>
        <ToggleForm pluginKey={pluginKey} enabled={true} label="Habilitar" variant="outline" />
      </div>
    );
  }

  if (consequences.blockedByDependents.length > 0) {
    return (
      <div className="flex flex-col items-end gap-1 text-right">
        <Badge variant="secondary">Habilitado</Badge>
        <Button type="button" variant="outline" size="sm" disabled>
          Desabilitar
        </Button>
        <p className="max-w-64 text-xs text-destructive">
          Depende deste plugin: {consequences.blockedByDependents.map((dependent) => dependent.name).join(", ")}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">Habilitado</Badge>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Desabilitar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desabilitar {pluginName}?</DialogTitle>
            <DialogDescription>
              Schema e dados do plugin permanecem intactos — desabilitar nunca apaga dado. Reabilitar restaura tudo abaixo.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Navegação removida:</span>{" "}
              {consequences.navigationLabels.length > 0 ? consequences.navigationLabels.join(", ") : "nenhum item"}
            </li>
            <li>
              <span className="font-medium text-foreground">Permissions removidas:</span>{" "}
              {consequences.permissionLabels.length > 0 ? consequences.permissionLabels.join(", ") : "nenhuma"}
            </li>
            <li>
              <span className="font-medium text-foreground">Usuários afetados:</span> {consequences.affectedUserCount}
            </li>
          </ul>

          <DialogFooter>
            <ToggleForm pluginKey={pluginKey} enabled={false} label="Confirmar desabilitação" variant="destructive" onSuccess={() => setOpen(false)} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
