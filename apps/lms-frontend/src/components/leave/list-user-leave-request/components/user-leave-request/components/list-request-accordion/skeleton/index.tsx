import { Skeleton } from "@/components/ui/skeleton";

export const LeaveRequestAccordionSkeleton = () => {
  return (
    <div className="border border-border rounded-md overflow-hidden bg-card">
      {/* Trigger */}
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 max-w-full" />
          <Skeleton className="h-3 w-52 max-w-full" />
        </div>
        <Skeleton className="h-6 w-24 shrink-0 rounded-md" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Facts bar */}
        <div className="flex flex-wrap gap-px overflow-hidden rounded-lg border border-border bg-border">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="min-w-37.5 flex-1 space-y-2 bg-muted/40 px-4 py-3"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Reason */}
        <div className="space-y-2 rounded-xl border border-border p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* Management decision */}
        <div className="rounded-xl border border-border p-4">
          <Skeleton className="mb-4 h-3 w-40" />
          <div>
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-4.5 w-4.5 shrink-0 rounded-full" />
                  {item < 2 && (
                    <div className="my-1 w-0.5 flex-1 rounded-full bg-muted-foreground/20" />
                  )}
                </div>
                <div
                  className={
                    item < 2 ? "min-w-0 flex-1 pb-5" : "min-w-0 flex-1"
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                    <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
                  </div>
                  <Skeleton className="mt-2 h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
