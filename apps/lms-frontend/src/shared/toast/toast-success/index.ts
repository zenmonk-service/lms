import { toast } from "sonner";

export function toastSuccess(message = "Action completed successfully!") {
  return toast.success(message, {
    classNames: {
      closeButton:
        "!absolute !left-auto !right-3 !top-1/2 !-translate-y-1/2 !transform !m-0 !size-6  [&>svg]:!size-5  !p-0",
    },
    style: {
      "--normal-bg":
        "light-dark(var(--color-green-600), var(--color-green-400))",
      "--normal-text": "var(--color-white)",
      "--normal-border":
        "light-dark(var(--color-green-600), var(--color-green-400))",
    } as React.CSSProperties,
    position: "bottom-left",
  });
}
