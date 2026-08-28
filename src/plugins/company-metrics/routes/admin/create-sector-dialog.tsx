"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateSectorForm } from "./create-sector-form";

export function CreateSectorDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Novo setor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo setor</DialogTitle>
          <DialogDescription>As métricas, metas e responsáveis são adicionados depois, dentro do setor.</DialogDescription>
        </DialogHeader>
        <CreateSectorForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
