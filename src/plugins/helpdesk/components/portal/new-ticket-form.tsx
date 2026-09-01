"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { PortalQueueOption } from "@/plugins/helpdesk";
import { MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "@/plugins/helpdesk/contracts/types";
import { openTicketAction, type PortalActionState } from "../../routes/portal/actions";

const initialState: PortalActionState = { error: null };

export function NewTicketForm({ queues }: { queues: PortalQueueOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [queueId, setQueueId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(openTicketAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Chamado aberto.",
    onSuccess: () => {
      setOpen(false);
      setQueueId("");
      setCategoryId("");
      formRef.current?.reset();
      if (state.reference) router.push(`/chamados/${state.reference}`);
      else router.refresh();
    },
  });

  const categories = useMemo(
    () => queues.find((queue) => queue.id === queueId)?.categories ?? [],
    [queues, queueId],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Abrir chamado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Abrir chamado</DialogTitle>
          <DialogDescription>Descreva o problema. A equipe da fila escolhida recebe o chamado.</DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-3">
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Fila
            <Select
              value={queueId}
              onValueChange={(value) => {
                setQueueId(value);
                setCategoryId("");
              }}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="selecione a equipe..." />
              </SelectTrigger>
              <SelectContent>
                {queues.map((queue) => (
                  <SelectItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="queueId" value={queueId} />
          </label>

          {categories.length > 0 && (
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Categoria (opcional)
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="categoryId" value={categoryId} />
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Título
            <Input name="title" required maxLength={160} placeholder="ex.: Lâmpada queimada — sala do Marketing" />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Descrição
            <Textarea name="description" required rows={4} placeholder="O que está acontecendo, desde quando, o que já tentou" />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Local (opcional)
            <Input name="location" placeholder="ex.: Bloco B, sala do Marketing" />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Fotos (até {MAX_TICKET_ATTACHMENTS_PER_SCOPE}, opcional)
            <input
              type="file"
              name="photos"
              accept="image/*,application/pdf"
              multiple
              className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
            />
          </label>

          <Button type="submit" disabled={pending || !queueId} className="w-full">
            {pending ? "Enviando..." : "Abrir chamado"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
