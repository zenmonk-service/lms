import { Skeleton } from "@/components/ui/skeleton";
import Title from "@/shared/typography/title";
import React from "react";

const AppearanceSkeleton = () => {
  return (
    <div className="p-6">
      <Title
        title={{
          text: "Appearance",
          className: "",
        }}
        description={{
          text: "Customize the look and feel of your LMS to align with your organization's branding and style preferences.",
          className: "",
        }}
        className=""
      />

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
