import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export function SelectOrganizationLoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <React.Fragment key={index}>
          {index === 0 && <Separator />}
          <div className="p-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="w-5 h-5" />
                </div>
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
            </div>
          </div>
          <Separator />
        </React.Fragment>
      ))}
    </>
  );
}
