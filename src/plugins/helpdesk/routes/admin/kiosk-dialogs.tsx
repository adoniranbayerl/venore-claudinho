"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { KioskListItem } from "@/plugins/helpdesk";
import { createKioskAction, updateKioskAction, type HelpdeskKioskActionState } from "./kiosk-actions";

const initialState: HelpdeskKioskActionState = { error: null };

type QueueOption = { id: string; name: string };

function QueueSelect({ options, defaultValue }: { options: QueueOption[]; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted-foreground">
      Fila fixada (opcional)
      <select
        name="queueId"
        defaultValue={defaultValue ?? ""}
        className="h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
      >
        <option value="">O solicitante escolhe a fila</option>
        {options.map((queue) => (
          <option key={queue.id} value={queue.id}>
            {queue.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CreateKioskDialog({ queueOptions }: { queueOptions: QueueOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createKioskAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Quiosque criado.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Novo quiosque
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo quiosque</DialogTitle>
          <DialogDescription>Um ponto de abertura sem login — gera um QR Code para colar no setor.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Nome
            <Input name="label" placeholder="ex.: Recepção Bloco A" required maxLength={80} />
          </label>
          <QueueSelect options={queueOptions} />
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Local padrão (opcional)
            <Input name="defaultLocation" placeholder="Pré-preenche o campo de local no formulário" maxLength={160} />
          </label>
          <Button type="submit" disabled={pending} className="w-full">
            Criar quiosque
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditKioskDialog({ kiosk, queueOptions }: { kiosk: KioskListItem; queueOptions: QueueOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateKioskAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Quiosque atualizado.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar quiosque">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar quiosque</DialogTitle>
          <DialogDescription>O token do QR Code não muda — o código impresso continua válido.</DialogDescription>
        </DialogHeader>
        <form key={`${kiosk.id}-${kiosk.updatedAt.valueOf()}`} action={formAction} className="space-y-3">
          <input type="hidden" name="kioskId" value={kiosk.id} />
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Nome
            <Input name="label" defaultValue={kiosk.label} required maxLength={80} />
          </label>
          <QueueSelect options={queueOptions} defaultValue={kiosk.queueId ?? ""} />
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Local padrão (opcional)
            <Input name="defaultLocation" defaultValue={kiosk.defaultLocation ?? ""} maxLength={160} />
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="active" value="true" defaultChecked={kiosk.active} className="size-4" />
            Quiosque ativo (recebe chamados)
          </label>
          <Button type="submit" disabled={pending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
