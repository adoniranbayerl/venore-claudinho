"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { SectorRecord } from "@/plugins/company-metrics/contracts/types";
import { EditSectorForm } from "./edit-sector-form";

export function EditSectorDialog({ sector }: { sector: SectorRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {sector.name}</DialogTitle>
        </DialogHeader>
        <EditSectorForm key={`${sector.id}:${String(sector.updatedAt)}`} sector={sector} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
