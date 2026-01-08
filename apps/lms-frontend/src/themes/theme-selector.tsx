"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";

const professionThemes = [
  { name: "Summer", value: "theme-summer", base: "#f66e60" },
  { name: "Modern Minimal", value: "theme-modern-minimal", base: "#3981f6" },
  { name: "Spotify", value: "theme-spotify", base: "#00b262" },
  { name: "Elegant Luxury", value: "theme-elegant-luxury", base: "#9e2c2c" },
  { name: "Slack", value: "theme-slack", base: "#611c69" },
  { name: "Corporate", value: "theme-corporate", base: "#0152cb" },
  { name: "Caffeine", value: "theme-caffeine", base: "#6f4e37" },
  { name: "VS Code", value: "theme-vs-code", base: "#26acf4" },
  { name: "Nature", value: "theme-nature", base: "#307b34" },
  { name: "Clean Slate", value: "theme-clean-slate", base: "#6468f0" },
  { name: "Marvel", value: "theme-marvel", base: "#d40c1a" },
  { name: "Pastel Dreams", value: "theme-pastel-dreams", base: "#a78bfb" },
];

interface ThemeSelectorProps {
  field?: any;
  number?: number;
}

export function ThemeSelector({ field, number }: ThemeSelectorProps) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {professionThemes.slice(0, number ?? 6).map((option) => {
        const selected = field.value?.value === option.value;
        return (
          <button
            key={option.name}
            type="button"
            onClick={async () => {
              await setTheme(option.value);
              field.onChange(option);
              const isDark = localStorage.getItem("theme-mode") === "dark";
              document.documentElement.style.colorScheme = isDark ? "dark" : "light";
            }}
            aria-pressed={selected}
            className={`relative flex flex-col items-start p-5 rounded-3xl border-2 transition-all duration-300 text-left group overflow-hidden 
          ${
            selected
              ? "shadow-md bg-accent border-accent-foreground"
              : "bg-card"
          }`}
          >
            {selected && (
              <div className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Check size={14} />
              </div>
            )}

            <div className="w-full aspect-4/3 rounded-2xl mb-4 overflow-hidden bg-background border border-border relative shadow-sm">
              <div
                className="absolute inset-x-0 top-0 h-4"
                style={{ backgroundColor: option.base }}
              />
              <div className="mt-6 px-3 space-y-2">
                <div className="h-2 w-1/2 rounded bg-slate-100" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded bg-slate-50 border border-slate-100" />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: `${option.base}15` }}
                  />
                </div>
                <div className="h-2 w-3/4 rounded" style={{backgroundColor: `${option.base}80`}} />
              </div>
            </div>

            <div className="z-10">
              <h4 className="font-bold text-sm">{option.name}</h4>
              <p className="text-[11px] text-card-foreground mt-0.5 uppercase tracking-tighter font-mono">
                {option.base}
              </p>
            </div>

            <div
              className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500"
              style={{ backgroundColor: option.base }}
            />
          </button>
        );
      })}
    </>
  );
}
