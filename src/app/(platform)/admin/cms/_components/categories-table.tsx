"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CategoryRecord } from "@/contexts/cms";

export function CategoriesTable({ categories }: { categories: Array<CategoryRecord & { entryCount: number }> }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter(
      (category) => category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term),
    );
  }, [categories, search]);

  return (
    <div className="space-y-3">
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nome ou endereço..."
        className="h-9 max-w-sm"
      />
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Conteúdos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">/{category.slug}</TableCell>
                <TableCell className="text-muted-foreground">{category.description ?? "—"}</TableCell>
                <TableCell className="text-right text-muted-foreground">{category.entryCount}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  Nenhuma categoria encontrada para &ldquo;{search}&rdquo;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
