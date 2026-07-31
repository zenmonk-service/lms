import { toast } from "sonner";

export function toastSuccess(message = "Action completed successfully!") {
  return toast.success(message, {
    style: {
      "--normal-bg":
        "light-dark(var(--color-green-600), var(--color-green-400))",
      "--normal-text": "var(--color-white)",
      "--normal-border":
        "light-dark(var(--color-green-600), var(--color-green-400))",
    } as React.CSSProperties,
  });
}
