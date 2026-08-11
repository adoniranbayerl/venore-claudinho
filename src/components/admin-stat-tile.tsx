import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Promovido de src/plugins/enrollment-dashboard (era genérico o bastante pra não precisar de
// nenhum tipo/dado próprio do plugin) — qualquer admin (core ou plugin) que precise de um número
// em destaque (total, contagem do mês, etc.) usa este componente em vez de reinventar o card.
export function AdminStatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-caps text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
