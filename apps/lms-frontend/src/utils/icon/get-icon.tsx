import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconConfig = {
  icon: LucideIcon;
  className?: string;
  size?: number;
};

export function getIcon(
  key: string | null | undefined,
  icons: Record<string, IconConfig>,
  options?: {
    className?: string;
    size?: number;
  },
) {
  if (!key) return null;

  const config = icons[key];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Icon
      size={options?.size ?? config.size}
      className={cn(config.className, options?.className)}
    />
  );
}