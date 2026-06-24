import { Skeleton } from "@/components/ui/skeleton";

export const LeaveRequestAccordionSkeleton = () => {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Trigger */}
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <div className="bg-muted p-2 rounded-md">
          <Skeleton className="h-4 w-4" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>

        <div className="ml-auto">
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Managers */}
          <div>
            <Skeleton className="h-4 w-32 mb-4" />

            {[1, 2].map((item) => (
              <div key={item} className="flex gap-3 mb-6">
                <Skeleton className="h-5 w-5 rounded-full mt-1" />

                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-3 w-20 mb-3" />

                  <div className="rounded-lg border p-3">
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>

                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="border rounded-xl p-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="border rounded-xl p-4 col-span-2">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
