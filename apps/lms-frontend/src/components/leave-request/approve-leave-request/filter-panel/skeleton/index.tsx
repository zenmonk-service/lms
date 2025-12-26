import { Skeleton } from "@/components/ui/skeleton";

export function FilterPanelSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton className="h-4 w-24 mb-3" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-xs" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
