import { cn } from "@/lib/utils";
import React from "react";

interface TitleProps {
  title: {
    text: string;
    className?: string;
  };
  description?: {
    text: string;
    className?: string;
  };
  className?: string;
  button?: React.ReactNode;
}

const Title = ({ title, description, className, button }: TitleProps) => {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between mb-2">
        <h1
          className={cn(
            "text-3xl tracking-tight leading-none font-bold text-foreground",
            title.className,
          )}
        >
          {title.text}
        </h1>
        {button && <div className="ml-auto">{button}</div>}
      </div>
      <p
        className={cn("text-sm text-muted-foreground", description?.className)}
      >
        {description?.text}
      </p>
    </div>
  );
};

export default Title;
