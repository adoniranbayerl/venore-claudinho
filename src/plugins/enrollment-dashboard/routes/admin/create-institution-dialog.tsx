"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateInstitutionForm } from "./create-institution-form";

export function CreateInstitutionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nova instituição
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova instituição</DialogTitle>
          <DialogDescription>Turmas/cursos e os números de matrícula são adicionados depois, na própria instituição.</DialogDescription>
        </DialogHeader>
        <CreateInstitutionForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
