import { Skeleton } from "@/components/ui/skeleton";

export function AssignPermissionSkeleton() {
  return (
    <div className="space-y-4 w-full">
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-lg">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
              <Skeleton className="h-8 w-20" />
          </div>

          {i === 1 && (
            <div className="px-4 pb-4 pt-2 border-t">
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex flex-col gap-2 items-center">
                    <Skeleton className="h-20 w-20 rounded" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
