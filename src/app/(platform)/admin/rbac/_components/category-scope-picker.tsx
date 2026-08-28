"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { CmsCategoryOption } from "@/platform/admin-shell/get-rbac-scope-options";

// Lista de categorias por NOME (nunca id cru — memória feedback_admin_ux_no_dev_jargon). Cada
// item marcado emite um <input type="checkbox" name={name}> com o id como value, então funciona
// dentro de um <form action={serverAction}> sem estado extra no submit.
export function CategoryScopePicker({
  categories,
  selected,
  onToggle,
  name = "categoryIds",
}: {
  categories: CmsCategoryOption[];
  selected: string[];
  onToggle: (id: string) => void;
  name?: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(term));
  }, [categories, search]);

  if (categories.length === 0) {
    return (
      <p className="rounded-panel border border-border bg-muted p-3 text-xs text-muted-foreground">
        Nenhuma categoria do CMS cadastrada ainda. Sem categorias, este papel fica com acesso a todo o
        conteúdo.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-panel border border-border">
      <div className="sticky top-0 z-10 border-b border-border bg-card p-2">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categoria por nome..."
          className="h-8"
        />
      </div>
      <div className="max-h-56 space-y-0.5 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">Nenhuma categoria encontrada.</p>
        )}
        {filtered.map((category) => (
          <label
            key={category.id}
            className="flex items-center gap-2 rounded-md p-1.5 ui-motion-base hover:bg-muted"
          >
            <input
              type="checkbox"
              name={name}
              value={category.id}
              checked={selected.includes(category.id)}
              onChange={() => onToggle(category.id)}
              className="rounded-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-foreground">{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
