import { cn } from "@/lib/utils";
import { THEMES } from "@/themes/theme.types";
import React from "react";

interface IProps {
  total: number;
  current: number;
  activeColor: string;
  onChange: (i: number) => void;
}

const PaginationDots = ({ total, current, activeColor, onChange }: IProps) => {
  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="tablist"
      aria-label="Theme pages"
    >
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={current === i}
          aria-label={`Page ${i + 1}`}
          onClick={() => onChange(i)}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            current === i
              ? "w-5"
              : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
          )}
          style={{ backgroundColor: current === i ? activeColor : undefined }}
        />
      ))}
    </div>
  );
};

export default PaginationDots;
