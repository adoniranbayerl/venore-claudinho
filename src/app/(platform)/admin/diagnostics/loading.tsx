import { Skeleton } from "@/components/ui/skeleton";

export default function DiagnosticsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}
