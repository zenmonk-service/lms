"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/shared/theme-toggle";
import Notification from "../notification";
import { AttendanceButton } from "../attendance/mark-attendance/components/attendance-button";
import { Separator } from "../ui/separator";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6 justify-between">
        <SidebarTrigger className="-ml-1" />
        <div className="space-x-3 flex items-center">
          <AttendanceButton size="sm" />
          <Separator orientation="vertical" className="h-6!" />
          <div className="inline space-x-1">
            <ThemeToggle />
            <Notification />
          </div>
        </div>
      </div>
    </header>
  );
}
