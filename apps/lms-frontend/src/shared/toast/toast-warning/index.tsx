import { toast } from "sonner";

export function toastWarning(message = "Action completed successfully!") {
  return toast.warning(message, {
    style: {
      "--normal-bg":
        "light-dark(var(--color-yellow-600), var(--color-yellow-400))",
      "--normal-text": "var(--color-white)",
      "--normal-border":
        "light-dark(var(--color-yellow-600), var(--color-yellow-400))",
    } as React.CSSProperties,
     position:"bottom-left"
  });
}
