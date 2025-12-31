"use client";

import { ThemeProvider as Theme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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
        "theme-pastel-dreams"
      ]}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </Theme>
  );
}
