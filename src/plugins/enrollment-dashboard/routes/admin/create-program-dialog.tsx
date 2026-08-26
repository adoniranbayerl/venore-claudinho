"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateProgramForm } from "./create-program-form";

export function CreateProgramDialog({ institutionId, programLabel }: { institutionId: string; programLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          {`Nov${programLabel.toLowerCase().endsWith("a") ? "a" : "o"} ${programLabel.toLowerCase()}`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Nov${programLabel.toLowerCase().endsWith("a") ? "a" : "o"} ${programLabel.toLowerCase()}`}</DialogTitle>
          <DialogDescription>Informe a meta e os números atuais de matrícula.</DialogDescription>
        </DialogHeader>
        <CreateProgramForm institutionId={institutionId} programLabel={programLabel} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
