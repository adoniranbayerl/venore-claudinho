import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EnrollmentGoalStatus } from "../contracts/types";
import { GOAL_STATUS_COPY } from "../shared/goal-status-copy";

export function GoalStatusBadge({ status, className }: { status: EnrollmentGoalStatus; className?: string }) {
  const copy = GOAL_STATUS_COPY[status];
  return (
    <Badge variant="outline" className={cn(copy.className, className)}>
      {copy.label}
    </Badge>
  );
}
