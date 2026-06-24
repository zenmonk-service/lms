import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="p-3 border rounded-lg shadow-sm bg-white space-y-3">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-md"
              style={{ minHeight: "82px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}