"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Toggle } from "../ui/toggle";
import { Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function SiteHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem("theme-mode") === "dark";
    setIsDark(mode);
    if (mode) {
      document.documentElement.style.colorScheme = "dark";
    }
  }, []);

  const toggleDarkMode = () => {
    const mode = !isDark;
    setIsDark(mode);
    localStorage.setItem("theme-mode", mode ? "dark" : "light");

    if (mode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6 justify-between">
        <SidebarTrigger className="-ml-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              aria-label="Toggle theme-mode"
              size="sm"
              variant="default"
              className="data-[state=on]:bg-transparent"
              onClick={toggleDarkMode}
            >
              <Sun
                className={`w-5 h-5 ${!isDark ? "fill-yellow-500 stroke-yellow-500" : "text-white"} transition-colors`}
              />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
