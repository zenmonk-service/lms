import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BALANCE_GRID } from "../utils";

export function BalanceListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            BALANCE_GRID,
            "items-center border-b border-border px-4 py-2.5 last:border-b-0",
          )}
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mx-auto h-4 w-10" />
          <Skeleton className="mx-auto h-4 w-10" />
          <Skeleton className="mx-auto h-4 w-10" />
          <Skeleton className="mx-auto h-4 w-10" />
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="mx-auto h-6 w-6 rounded-md" />
        </div>
      ))}
    </>
  );
}
