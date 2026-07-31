"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/shared/theme-toggle";
import Notification from "../../notification";
import { Separator } from "../../ui/separator";
import LogoutPopover from "./logout-popover";
import { AttendanceButton } from "@/components/attendance/my-attendance/components/attendance-button";


export function SiteHeader() {

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6 justify-between">
        <SidebarTrigger className="-ml-1" />
        <div className="space-x-3 flex items-center">
          <AttendanceButton size="sm" />
          <Separator orientation="vertical" className="h-6!" />
          <div className="flex items-center">
            <ThemeToggle />
            <Notification />
            <LogoutPopover />
          </div>
        </div>
      </div>
    </header>
  );
}
