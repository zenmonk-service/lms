import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Title from "@/shared/typography/title";
import React from "react";

const AppearanceSkeleton = () => {
  return (
    <div>
      <Title
        title={{ text: "Appearance" }}
        description={{ text: "Customize the look and feel of your LMS to align with your organization's branding and style preferences." }}
      />
      <Separator className="mb-6" />
      <div className="min-h-[calc(100vh-186px)] flex justify-center items-center">
        <div className="space-y-5 flex-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-36 rounded" />
            <div className="flex items-center gap-1">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-4 rounded-2xl border-2 border-border bg-card"
              >
                <Skeleton className="w-full aspect-[4/3] rounded-xl" />

                <div className="flex items-end justify-between gap-2">
                  <div className="space-y-1.5 flex-1 overflow-hidden">
                    <Skeleton className="h-3.5 w-2/3 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                  <Skeleton className="shrink-0 size-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-1.5 w-1.5 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSkeleton;
