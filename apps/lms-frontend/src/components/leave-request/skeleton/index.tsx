import { Skeleton } from "@/components/ui/skeleton";

export function LeaveRequestSkeleton() {
  return (
    <div className="w-full bg-card px-4 pb-4 rounded-md shadow-sm space-y-2 mt-4 max-h-[calc(100vh-327px)] overflow-auto">
      {[1, 2, 3].map((item) => (
        <div key={item} className="border-b border-border py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="ml-3 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col gap-2 ml-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24 rounded-sm" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-6 w-24 rounded-sm" />
            </div>
          </div>

          {item === 1 && (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-px w-full" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  {[1, 2].map((manager) => (
                    <div key={manager} className="flex gap-3 mt-4">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-16 w-full rounded-lg mt-2" />
                      </div>
                      <Skeleton className="h-6 w-24 rounded-sm" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                  <Skeleton className="h-32 rounded-lg" />

                  <div className="flex gap-4 justify-end pt-4">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-9 w-40" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
