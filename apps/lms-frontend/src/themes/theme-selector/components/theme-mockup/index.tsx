import { Check } from "lucide-react";
import React from "react";

interface IProps {
  base: string;
  selected: boolean;
}

const ThemeMockup = ({ base, selected }: IProps) => {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted/40 border border-border shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-5"
        style={{ backgroundColor: base }}
      />

      <div className="absolute inset-0 top-5 flex gap-2 p-2">
        <div className="w-[28%] bg-background rounded-md flex flex-col gap-1.5 p-1.5 border border-border/60">
          <div className="h-1.5 w-full rounded-sm bg-muted" />
          <div className="h-1.5 w-3/4 rounded-sm bg-muted" />
          <div
            className="h-1.5 w-2/3 rounded-sm"
            style={{ backgroundColor: `${base}55` }}
          />
          <div className="h-1.5 w-1/2 rounded-sm bg-muted" />
          <div className="h-1.5 w-2/3 rounded-sm bg-muted" />
        </div>

        <div className="flex-1 flex flex-col gap-1.5 py-0.5">
          <div className="h-2.5 w-1/2 rounded-sm bg-foreground/20" />
          <div className="h-1.5 w-full rounded-sm bg-muted" />
          <div className="h-1.5 w-5/6 rounded-sm bg-muted" />
          <div
            className="mt-1 h-4 w-14 rounded-md"
            style={{ backgroundColor: `${base}22` }}
          />
          <div className="mt-1 h-1.5 w-full rounded-sm bg-muted" />
          <div className="h-1.5 w-3/4 rounded-sm bg-muted" />
        </div>
      </div>

      {selected && (
        <div className="absolute bottom-2 right-2 size-5 rounded-full bg-foreground flex items-center justify-center shadow-sm">
          <Check className="size-3 text-background" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
};

export default ThemeMockup;
