import { Skeleton } from "@/components/ui/skeleton";

export default function DiagnosticsAuditLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}
