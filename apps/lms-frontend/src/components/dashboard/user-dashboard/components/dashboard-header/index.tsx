"use client";

import { useAppSelector } from "@/store";
import { getBadge } from "@/utils/badge/get-badge";
import { Dot } from "lucide-react";

export function DashboardHeader() {
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold capitalize wrap-break-word">
          {getGreeting()}, {currentUser?.name}
        </h2>
        <div className="flex items-center gap-2">
          {currentUser?.role?.name && getBadge("default", currentUser.role.name, undefined, "secondary")}
          <Dot className="h-4 w-4" />
          <p className="text-sm text-muted-foreground">
            {currentUser?.email ? `${currentUser.email}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
