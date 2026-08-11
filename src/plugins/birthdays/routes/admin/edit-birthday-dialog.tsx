"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BirthdayAdminView } from "@/plugins/birthdays";
import { EditBirthdayForm } from "./edit-birthday-form";

export function EditBirthdayDialog({ birthday }: { birthday: BirthdayAdminView }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Editar ${birthday.fullName}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar aniversariante</DialogTitle>
          <DialogDescription>{birthday.fullName}</DialogDescription>
        </DialogHeader>
        <EditBirthdayForm birthday={birthday} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
