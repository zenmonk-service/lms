import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonUserLeaveRequest() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 p-4 border-b border-border">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-3 mt-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white flex-1 flex flex-col gap-4 overflow-y-auto border-b border-border">
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-40" />
          <Skeleton className="flex-1 h-40" />
        </div>

        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      <div className="p-4 bg-white flex gap-4">
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 flex-1 rounded" />
      </div>
    </div>
  );
}
