import { Skeleton } from "@/components/ui/skeleton";

export function OrgSkeleton() {
  return (
    <div className="space-x-4 flex">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 border border-border p-4 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-none" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
