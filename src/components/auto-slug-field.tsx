"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Regra de negócio real (kebab-case, unicidade) continua nos handlers/services de cms — isto só
// evita que o usuário precise digitar o identificador à mão: sugere a partir do texto de origem
// (nome/título) e deixa um "editar" discreto para ajustar quando precisar.
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AutoSlugField({
  name,
  sourceValue,
  defaultValue,
  label,
  required = true,
}: {
  name: string;
  sourceValue: string;
  defaultValue?: string;
  label: string;
  required?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [manualValue, setManualValue] = useState(defaultValue ?? "");
  const value = editing ? manualValue : (defaultValue ?? slugify(sourceValue));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-muted-foreground">{label}</label>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setManualValue(value);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="size-3" strokeWidth={1.5} />
            editar
          </button>
        )}
      </div>
      <Input
        name={name}
        required={required}
        readOnly={!editing}
        value={value}
        onChange={(event) => setManualValue(event.target.value)}
        className={cn("mt-1", !editing && "text-muted-foreground")}
      />
      <p className="mt-1 text-xs text-muted-foreground/56">
        {editing
          ? "Apenas letras minúsculas, números e hífen."
          : "Sugerido automaticamente — clique em \"editar\" para ajustar."}
      </p>
    </div>
  );
}
