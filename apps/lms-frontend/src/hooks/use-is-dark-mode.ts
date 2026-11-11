"use client";

import { useSyncExternalStore } from "react";

// Dark mode is the `dark` class on <html> (set by ThemeToggle), separate from the
// next-themes color theme, so `useTheme().resolvedTheme` never reports "dark".
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

/** True while the app is in dark mode; updates live when the mode is toggled. */
export function useIsDarkMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
