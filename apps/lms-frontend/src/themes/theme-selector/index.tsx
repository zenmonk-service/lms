"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import ThemeMockup from "./components/theme-mockup";
import ThemeCard from "./components/theme-card";
import PaginationDots from "./components/pagination-dots";
import { Theme, THEMES } from "../theme.types";

interface IProps {
  field: ControllerRenderProps<FieldValues, "theme">;
}

const PER_PAGE = 6;
const TOTAL_PAGES = Math.ceil(THEMES.length / PER_PAGE);

export function ThemeSelector({ field }: IProps) {
  const { setTheme } = useTheme();
  const [page, setPage] = useState(0);

  const visibleThemes = useMemo(
    () => THEMES.slice(page * PER_PAGE, (page + 1) * PER_PAGE),
    [page],
  );

  const selectedValue = field?.value?.value;
  const activeColor =
    THEMES.find((t) => t.value === selectedValue)?.base ?? THEMES[6].base;

  const handleSelect = async (theme: Theme) => {
    await setTheme(theme.value);
    field?.onChange({ value: theme.value, name: theme.name });

    const isDark = localStorage.getItem("theme-mode") === "dark";
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  };

  const prevPage = () => setPage((p) => (p - 1 + TOTAL_PAGES) % TOTAL_PAGES);
  const nextPage = () => setPage((p) => (p + 1) % TOTAL_PAGES);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {THEMES.length} presets · page {page + 1} of {TOTAL_PAGES}
        </p>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={prevPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={nextPage}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {visibleThemes.map((theme) => (
          <ThemeCard
            key={theme.value}
            theme={theme}
            selected={selectedValue === theme.value}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <PaginationDots
        total={TOTAL_PAGES}
        current={page}
        activeColor={activeColor}
        onChange={setPage}
      />
    </div>
  );
}
