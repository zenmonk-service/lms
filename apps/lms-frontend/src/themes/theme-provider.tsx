"use client";

import { ThemeProvider as Theme } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  
  useEffect(() => {
    const mode = localStorage.getItem("theme-mode");
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  return (
    <Theme
      attribute="class"
      defaultTheme="theme-summer"
      themes={[
        "theme-summer",
        "theme-vs-code",
        "theme-spotify",
        "theme-corporate",
        "theme-modern-minimal",
        "theme-elegant-luxury",
        "theme-slack",
        "theme-nature",
        "theme-clean-slate",
        "theme-marvel",
        "theme-caffeine",
        "theme-pastel-dreams",
      ]}
      enableSystem={false}
      enableColorScheme
      disableTransitionOnChange
    >
      {children}
    </Theme>
  );
}
