import { Badge } from "@/components/ui/badge";
import type { EventLevel } from "@/observability";

const LEVEL_LABEL: Record<EventLevel, string> = {
  info: "Info",
  warn: "Atenção",
  error: "Erro",
  critical: "Crítico",
};

const LEVEL_VARIANT: Record<EventLevel, "secondary" | "outline" | "destructive"> = {
  info: "secondary",
  warn: "outline",
  error: "destructive",
  critical: "destructive",
};

export function LevelBadge({ level }: { level: EventLevel }) {
  return (
    <Badge
      variant={LEVEL_VARIANT[level]}
      className={level === "critical" ? "border border-destructive" : undefined}
    >
      {LEVEL_LABEL[level]}
    </Badge>
  );
}
