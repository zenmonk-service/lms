import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BADGE_CONFIG, BadgeVariant } from "./badge.config";

export function getBadge(
  value: string,
  text?: string,
  icon?: React.ReactNode,
  variant?: BadgeVariant,
  className?: string,
) {
  if (!value) return null;

  const config = BADGE_CONFIG[value];

  const Icon = config?.badgeIcon;

  return (
    <Badge variant={variant ?? config?.variant ?? "outline"} className={cn("capitalize", config?.className, className)}>
      {icon ?? (Icon ? <Icon size={12} /> : undefined)}
      {text ?? config?.text ?? value}
    </Badge>
  );
}