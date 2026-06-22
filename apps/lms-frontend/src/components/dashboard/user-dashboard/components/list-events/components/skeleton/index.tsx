import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ListEventsSkeleton() {
  return (
    <CardContent className="space-y-3 max-h-66 overflow-y-auto no-scrollbar">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 border-b border-border pb-3 last:border-b-0"
        >
          {/* Date badge */}
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />

          {/* Event details */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>

          {/* Status badge */}
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </CardContent>
  );
}
