"use client";

import { useEffect, useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchContentAction, type ContentSearchResult } from "../actions";

// Seletor de conteúdo por busca — nunca um campo de id ou URL solto pro editor preencher à mão.
export function ContentPicker({
  selected,
  onSelect,
}: {
  selected: ContentSearchResult | null;
  onSelect: (entry: ContentSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentSearchResult[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const found = await searchContentAction(query);
      setResults(found);
    });
  }, [query]);

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar conteúdo por título…"
      />
      <div className="max-h-56 overflow-y-auto rounded-md border border-border">
        {pending && <p className="p-3 text-xs text-muted-foreground">Buscando…</p>}
        {!pending && results.length === 0 && (
          <p className="p-3 text-xs text-muted-foreground">Nenhum conteúdo encontrado.</p>
        )}
        <ul className="divide-y divide-border">
          {results.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                  selected?.id === entry.id && "bg-accent/14",
                )}
              >
                <FileText className="size-4 shrink-0 text-muted-foreground/56" />
                <span className="min-w-0 flex-1 truncate text-foreground">{entry.title}</span>
                {entry.status === "draft" && (
                  <Badge className="bg-warning-soft text-warning" variant="outline">
                    Rascunho
                  </Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground">
          Selecionado: <span className="text-foreground">{selected.title}</span>
        </p>
      )}
    </div>
  );
}
