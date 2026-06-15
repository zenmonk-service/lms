export const THEMES = [
  { name: "Summer", value: "theme-summer", base: "#f66e60" },
  { name: "Modern Minimal", value: "theme-modern-minimal", base: "#3981f6" },
  { name: "Spotify", value: "theme-spotify", base: "#00b262" },
  { name: "Minimal", value: "theme-minimal", base: "#0F172B" },
  { name: "Slack", value: "theme-slack", base: "#611c69" },
  { name: "Corporate", value: "theme-corporate", base: "#0152cb" },
  { name: "Caffeine", value: "theme-caffeine", base: "#6f4e37" },
  { name: "VS Code", value: "theme-vs-code", base: "#26acf4" },
  { name: "Nature", value: "theme-nature", base: "#307b34" },
  { name: "Clean Slate", value: "theme-clean-slate", base: "#6468f0" },
  { name: "Marvel", value: "theme-marvel", base: "#d40c1a" },
  { name: "Pastel Dreams", value: "theme-pastel-dreams", base: "#a78bfb" },
] as const;

export type Theme = (typeof THEMES)[number];

