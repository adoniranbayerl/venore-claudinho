import { Skeleton } from "@/components/ui/skeleton";

export default function RbacLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-32" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-panel border border-border bg-card ui-panel-padding-roomy space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      ))}
    </div>
  );
}
