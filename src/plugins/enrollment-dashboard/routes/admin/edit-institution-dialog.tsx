"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { EnrollmentInstitution } from "@/plugins/enrollment-dashboard";
import { EditInstitutionForm } from "./edit-institution-form";

export function EditInstitutionDialog({ institution, logo }: { institution: EnrollmentInstitution; logo: PickableMedia | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Editar ${institution.name}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar instituição</DialogTitle>
          <DialogDescription>{institution.name}</DialogDescription>
        </DialogHeader>
        <EditInstitutionForm institution={institution} logo={logo} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
