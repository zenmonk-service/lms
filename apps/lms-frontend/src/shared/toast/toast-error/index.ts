import { toast } from "sonner";

export function toastError(message: string) {
  return toast.error(message || "Something went wrong", {
    style: {
      "--normal-bg":
        "light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))",
      "--normal-text": "var(--color-white)",
      "--normal-border": "transparent",
    } as React.CSSProperties,
  });
}
