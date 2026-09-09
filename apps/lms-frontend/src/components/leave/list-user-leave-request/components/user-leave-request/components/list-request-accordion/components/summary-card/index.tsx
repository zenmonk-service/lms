import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IProps {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "destructive";
  className?: string;
  children: ReactNode;
}

export function SummaryCard({
  icon: Icon,
  label,
  tone = "default",
  className,
  children,
}: IProps) {
  const isDestructive = tone === "destructive";

  return (
    <div
      className={cn(
        "p-4 border rounded-xl space-y-1",
        isDestructive
          ? "bg-destructive/10 border-destructive/30"
          : "bg-muted border-border",
        className,
      )}
    >
      <h3
        className={cn(
          "text-[11px] font-semibold flex items-center gap-1.5",
          isDestructive ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <Icon size={12} />
        {label}
      </h3>
      {children}
    </div>
  );
}
