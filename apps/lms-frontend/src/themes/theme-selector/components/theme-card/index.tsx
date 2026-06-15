import { cn } from "@/lib/utils";
import React from "react";
import ThemeMockup from "../theme-mockup";
import { Theme } from "@/themes/theme.types";

interface IProps {
  theme: Theme;
  selected: boolean;
  onSelect: (t: Theme) => void;
}

const ThemeCard = ({ theme, selected, onSelect }: IProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme)}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col gap-3 p-4 rounded-2xl border-2 text-left w-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-foreground ring-2 ring-foreground/10 bg-card"
          : "border-border hover:border-foreground/40 bg-card hover:bg-accent/40",
      )}
    >
      <ThemeMockup base={theme.base} selected={selected} />

      <div className="flex items-end justify-between gap-2">
        <div className="space-y-0.5 overflow-hidden">
          <p className="text-sm font-semibold text-card-foreground truncate">
            {theme.name}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wide">
            {theme.base}
          </p>
        </div>

        {/* Color swatch */}
        <div
          className="shrink-0 size-5 rounded-full border-2 border-background shadow-sm ring-1 ring-border"
          style={{ backgroundColor: theme.base }}
        />
      </div>
    </button>
  );
};

export default ThemeCard;
