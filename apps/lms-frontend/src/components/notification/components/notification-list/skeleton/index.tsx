import { Skeleton } from "@/components/ui/skeleton";

const NotificationListSkeleton = () => {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <Skeleton className="size-4 rounded-full" />
          </div>

          <div className="flex justify-end mt-2">
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationListSkeleton;
