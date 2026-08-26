"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { EnrollmentProgramMetrics } from "@/plugins/enrollment-dashboard";
import { EditProgramForm } from "./edit-program-form";

export function EditProgramDialog({ program, programLabel }: { program: EnrollmentProgramMetrics; programLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Editar ${program.label}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {programLabel.toLowerCase()}</DialogTitle>
          <DialogDescription>{program.label}</DialogDescription>
        </DialogHeader>
        <EditProgramForm program={program} programLabel={programLabel} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
