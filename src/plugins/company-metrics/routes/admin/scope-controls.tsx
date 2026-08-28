"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Seletor de setor (e, opcional, data de referência) que dirige a query da URL — usado pelas abas
// Métricas e Lançamentos.
export function ScopeControls({
  sectors,
  activeSectorId,
  showDate = false,
  activeDate,
}: {
  sectors: { id: string; name: string }[];
  activeSectorId: string;
  showDate?: boolean;
  activeDate?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) next.set(key, value);
    router.push(`?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Setor
        <Select value={activeSectorId} onValueChange={(value) => update({ sector: value })}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="selecione..." />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      {showDate && (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Data de referência
          <Input
            type="date"
            defaultValue={activeDate}
            className="w-44"
            onChange={(event) => {
              if (event.target.value) update({ date: event.target.value });
            }}
          />
        </label>
      )}
    </div>
  );
}
