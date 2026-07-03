import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";
import React from "react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-11/12 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {dayjs().format("DD MMMM YYYY")}
            </h2>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
