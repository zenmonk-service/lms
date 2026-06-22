"use client";

import { getBadge } from "@/utils/get-badge";
import { Dot } from "lucide-react";

interface IProps {
  analyticsUserName: string;
  analyticsUserEmail: string;
  role?: string;
}

export function DashboardHeader({
  analyticsUserName,
  analyticsUserEmail,
  role,
}: IProps) {

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold capitalize wrap-break-word">
          {getGreeting()}, {analyticsUserName}!
        </h2>
        <div className="flex items-center gap-2">
          {role && getBadge("default", role, undefined, "secondary")}
          <Dot className="h-4 w-4" />
          <p className="text-sm text-muted-foreground">
            {analyticsUserEmail ? `${analyticsUserEmail}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
