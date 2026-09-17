import { cn } from "@/lib/utils";
import React from "react";

const MainContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className={cn("w-11/12 min-[1400px]:w-3/4 py-6 sm:p-6", className)}>
        {children}
      </div>
    </div>
  );
};

export default MainContainer;
