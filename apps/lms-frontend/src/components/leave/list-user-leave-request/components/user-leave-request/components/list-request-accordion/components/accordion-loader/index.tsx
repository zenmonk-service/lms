import { Skeleton } from "@/components/ui/skeleton";

export function AccordionLoader() {
  return (
    <>
      {[1, 2].map((item) => (
        <div key={`skeleton-${item}`} className="border-b border-border py-4">
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
            </div>
            <div className="ml-auto">
              <Skeleton className="h-6 w-24 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
