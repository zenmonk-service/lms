"use client";

import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
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
  );
};

export default ThemeToggle;
