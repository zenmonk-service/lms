import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const AppearanceSkeleton = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Select a color palette and layout density that matches your corporate
          identity.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-start p-5 rounded-3xl border-2 bg-card"
          >
            <Skeleton className="w-full aspect-4/3 rounded-2xl mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/3 mb-1" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppearanceSkeleton;
