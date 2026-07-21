import { Skeleton } from "@/components/ui/skeleton";

export const LeaveRequestAccordionSkeleton = () => {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Trigger */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 border-b">
        <div className="bg-muted p-2 rounded-md shrink-0">
          <Skeleton className="h-4 w-4" />
        </div>

        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton className="h-4 w-32 max-w-full" />
          <Skeleton className="h-3 w-40 max-w-full" />
        </div>

        <div className="w-full sm:w-auto sm:ml-auto">
          <Skeleton className="h-6 w-24 rounded-md sm:ml-auto" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Managers */}
          <div>
            <Skeleton className="h-4 w-32 mb-4" />

            {[1, 2].map((item) => (
              <div key={item} className="flex gap-3 mb-6">
                <Skeleton className="h-5 w-5 rounded-full mt-1 shrink-0" />

                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-3 w-20 mb-3" />

                  <div className="rounded-lg border p-3">
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>

                <Skeleton className="hidden sm:block h-6 w-20 rounded-md shrink-0" />
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="border rounded-xl p-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="border rounded-xl p-4 sm:col-span-2">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
              <Skeleton className="h-9 w-full sm:w-32" />
              <Skeleton className="h-9 w-full sm:w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};