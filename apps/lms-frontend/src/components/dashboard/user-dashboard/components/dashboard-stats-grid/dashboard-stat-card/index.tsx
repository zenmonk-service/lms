import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface IProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName?: string;
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  iconClassName = "h-4 w-4 text-muted-foreground",
}: IProps) {
  return (
    <Card className="border border-border shadow-none pt-6">
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className={iconClassName} />
        </div>
        <p className="text-2xl font-bold">{value} day{value > 1 ? "s" : ""}</p>
      </CardContent>
    </Card>
  );
}