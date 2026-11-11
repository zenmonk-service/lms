"use client";

import { useEffect, useState } from "react";
import { ControlButton } from "@xyflow/react";
import { Check, ListTree, Network, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import type { LayoutMode } from "./layout";

const LAYOUTS: {
  mode: LayoutMode;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
}[] = [
  {
    mode: "top-down",
    title: "Top-down",
    description: "Classic org chart: managers above the people who report to them.",
    icon: Network,
  },
  {
    mode: "left-right",
    title: "Left-right",
    description: "Managers on the left, their reports in the next column. Good for deep hierarchies.",
    icon: Network,
    iconClassName: "-rotate-90",
  },
  {
    mode: "compact",
    title: "Compact",
    description: "Stacks a manager's reports in a list below them. Much narrower for large teams.",
    icon: ListTree,
  },
];

/** Bottom-bar button that re-arranges the canvas with a chosen layout (keys 1–3 while open). */
export default function ArrangeMenu({
  mode,
  onArrange,
}: {
  mode: LayoutMode;
  onArrange: (mode: LayoutMode) => void;
}) {
  const [open, setOpen] = useState(false);

  const choose = (next: LayoutMode) => {
    onArrange(next);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const layout = LAYOUTS[Number(event.key) - 1];
      if (layout) {
        event.preventDefault();
        choose(layout.mode);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // re-bind each render so `choose` sees current props

  const Current = LAYOUTS.find((l) => l.mode === mode) ?? LAYOUTS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ControlButton title="Auto-arrange" aria-label="Auto-arrange">
          <Current.icon className={cn("!fill-none", Current.iconClassName)} />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" sideOffset={10} className="w-80 p-1.5">
        <p className="px-2.5 pb-1.5 pt-1 text-sm font-semibold">Auto-arrange</p>
        <ul role="menu" className="space-y-0.5">
          {LAYOUTS.map((layout, i) => {
            const active = layout.mode === mode;
            return (
              <li key={layout.mode}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => choose(layout.mode)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                    active && "bg-accent/60",
                  )}
                >
                  <layout.icon
                    className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground", layout.iconClassName)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      {layout.title}
                      {active && <Check className="size-3.5 text-muted-foreground" />}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {layout.description}
                    </span>
                  </span>
                  <Kbd className="mt-0.5">{i + 1}</Kbd>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t px-2.5 pb-1 pt-2 text-[11px] text-muted-foreground">
          Resets cards you moved by hand. Shift+drag a card to move its whole branch.
        </p>
      </PopoverContent>
    </Popover>
  );
}
