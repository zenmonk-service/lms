"use client";

import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/shared/theme-toggle";
import Notification from "../../notification";
import { Separator } from "../../ui/separator";
import LogoutPopover from "./logout-popover";
import { AttendanceButton } from "@/components/attendance/my-attendance/components/attendance-button";
import { useAttendanceButton } from "@/components/attendance/my-attendance/hooks/use-attendance-button";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

function AttendanceRemark() {
  const { isOnLeaveToday, isOrganizationHolidayToday } = useAttendanceButton();
  const shouldShow = isOnLeaveToday || isOrganizationHolidayToday;

  const [open, setOpen] = useState(shouldShow);

  useEffect(() => {
    if (shouldShow) setOpen(true);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="absolute -bottom-6 w-full left-0"
    >
      <CollapsibleContent>
        <div className="flex justify-center bg-destructive w-full">
          <div className="flex-1 text-center">
            {isOrganizationHolidayToday && (
              <span className="font-medium text-xs underline text-primary-foreground">
                Today is an organization holiday. Attendance is not required.
              </span>
            )}
            {isOnLeaveToday && (
              <span className="text-xs text-primary-foreground">
                You are on leave today. Attendance is not required.
              </span>
            )}
          </div>
          <Button
            variant="link"
            size="icon-xs"
            className="ml-auto"
            onClick={() => setOpen(false)}
          >
            <X className="text-primary-foreground" />
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h(--header-height) relative">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6 justify-between">
        <SidebarTrigger className="-ml-1" />
        <AttendanceRemark />
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