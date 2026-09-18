import { toast } from "sonner";

export function toastWarning(message = "Action completed successfully!") {
  return toast.warning(message, {
    classNames: {
      closeButton:
        "!absolute !left-auto !right-3 !top-1/2 !-translate-y-1/2 !transform !m-0 !size-6  [&>svg]:!size-5  !p-0",
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
