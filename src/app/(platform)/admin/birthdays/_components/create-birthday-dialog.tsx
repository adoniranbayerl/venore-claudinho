"use client";

import { useState } from "react";
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
import { CreateBirthdayForm } from "./create-birthday-form";

export function CreateBirthdayDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Novo aniversariante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo aniversariante</DialogTitle>
          <DialogDescription>Cadastre nome, mês e dia — o ano de nascimento não é registrado.</DialogDescription>
        </DialogHeader>
        <CreateBirthdayForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
