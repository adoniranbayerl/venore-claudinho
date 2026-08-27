"use client";

import { useActionState, useState } from "react";
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
import { seedPluginAction, type PluginsActionState } from "../actions";

const initialState: PluginsActionState = { error: null };

// Botão "Popular dados de exemplo" pra um plugin JÁ instalado (mesmo padrão de
// InstallPluginControl). Na instalação a mesma ação é a caixa de marcar do diálogo de instalar.
export function SeedPluginControl({ pluginKey, pluginName }: { pluginKey: string; pluginName: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(seedPluginAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Dados de exemplo populados.",
    onSuccess: () => setOpen(false),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Popular dados de exemplo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Popular {pluginName} com dados de exemplo?</DialogTitle>
          <DialogDescription>
            Cria conteúdo de demonstração para este plugin. É idempotente — rodar de novo não duplica o que já existe.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="pluginKey" value={pluginKey} />
          <DialogFooter>
            <Button type="submit" variant="default" size="sm" disabled={pending}>
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
