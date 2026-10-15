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
      <div className="mb-2 flex w-full min-w-0 items-start justify-between gap-3">
        <h1
          className={cn(
            "min-w-0 flex-1 text-3xl font-bold leading-tight tracking-tight text-foreground [overflow-wrap:anywhere]",
            title.className,
          )}
        >
          {title.text}
        </h1>

        {button && <div className="shrink-0">{button}</div>}
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
