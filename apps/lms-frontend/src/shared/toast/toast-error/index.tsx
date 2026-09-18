import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

export function toastError(
  message = "Something went wrong",
  description?: string,
) {
  return toast.error(message, {
    description,

    icon: <CircleAlert size={16} className="text-white" />,

    closeButton: true,
    classNames: {
      closeButton:
        "!absolute !left-auto !right-3 !top-1/2 !-translate-y-1/2 !transform !m-0 !size-6  [&>svg]:!size-5  !p-0",
    },
    style: {
      "--normal-bg":
        "light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))",
      "--normal-text": "var(--color-white)",
      "--normal-border": "transparent",
      "--close-button-color": "var(--color-white)",
    } as React.CSSProperties,

    position: "bottom-left",
  });
}
