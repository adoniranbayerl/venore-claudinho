"use client";

import { useActionState, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { scheduleEntryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function ScheduleEntryDialog({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(scheduleEntryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Publicação agendada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs">
          <CalendarClock className="size-3" /> Agendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar conteúdo</DialogTitle>
          <DialogDescription>
            Publica sozinho no horário definido. Arquivamento é opcional e independente da publicação.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={entryId} />

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Publicar em</label>
            <Input type="datetime-local" name="scheduledPublishAt" required className="mt-1" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Arquivar em (opcional)</label>
            <Input type="datetime-local" name="scheduledArchiveAt" className="mt-1" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
