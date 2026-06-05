import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const LeaveRequestSkeleton = () => {
  return (
    <div className="overflow-y-auto flex-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border-b border-border flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-3 w-28" />
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveRequestSkeleton;
