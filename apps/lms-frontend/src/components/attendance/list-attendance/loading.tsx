import { Skeleton } from "@/components/ui/skeleton"

export function UserListSkeleton() {
  return (
    <div className="w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="w-full flex items-center justify-between p-4 border-b last:border-0"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-25" />
              <Skeleton className="h-2 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  )
}