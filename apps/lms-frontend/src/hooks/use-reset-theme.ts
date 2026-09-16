"use client";

import { useTheme } from "next-themes";

export function useResetTheme() {
  const { setTheme } = useTheme();

  const resetTheme = () => {
    setTheme("theme-minimal");
  };

  return resetTheme;
}
