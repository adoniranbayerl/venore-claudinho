import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
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
