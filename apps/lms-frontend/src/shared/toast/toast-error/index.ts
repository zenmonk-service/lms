import { toast } from "sonner";

export function toastError(message = "Something went wrong") {
  return toast.error(message, {
    style: {
      "--normal-bg":
        "light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))",
      "--normal-text": "var(--color-white)",
      "--normal-border": "transparent",
    } as React.CSSProperties,
  });
}
