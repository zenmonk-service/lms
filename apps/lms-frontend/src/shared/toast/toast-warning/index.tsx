import { toast } from "sonner";

export function toastWarning(message = "Action completed successfully!") {
  return toast.warning(message, {
    classNames: {
      toast: "!text-white",
      title: "!text-white",
      description: "!text-white",
      icon: "!text-white",
      closeButton: [
        // Always keep contrast against the green toast
        "!text-white",

        // Hover state
        "hover:!bg-white/30",
        "hover:!text-white",

        // Remove theme-dependent border/shadow
        "!border-0",
        "!shadow-none",

        // Make sure Sonner's SVG follows the text color
        "[&>svg]:!size-4",
        "[&>svg]:!text-white",
        "[&>svg]:!stroke-white",

        "!absolute !left-auto !right-3 !top-1/2 !-translate-y-1/2 !transform !m-0 !size-6  [&>svg]:!size-5  !p-0",
      ].join(" "),
    },
    style: {
      "--normal-bg":
        "light-dark(var(--color-yellow-600), var(--color-yellow-400))",
      "--normal-text": "var(--color-white)",
      "--normal-border":
        "light-dark(var(--color-yellow-600), var(--color-yellow-400))",
    } as React.CSSProperties,
    position: "bottom-left",
  });
}
