import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DayStatus,
  OrganizationEvents,
} from "@/features/organizations/organizations.types";
import { getBadge } from "@/utils/badge/get-badge";
import React from "react";

interface IProps {
  event: OrganizationEvents;
}

export default function ListIndividualEvent({ event }: IProps) {
  const getMonthName = (date: string) => {
    const monthIndex = new Date(date).getMonth();
    return new Date(0, monthIndex).toLocaleString("en-US", {
      month: "short",
    });
  };

  const getDay = (date: string) => {
    return new Date(date).getDate();
  };

  const getStyleForEvent = (status: DayStatus) => {
    switch (status) {
      case DayStatus.PUBLIC_HOLIDAY:
        return "border-transparent bg-error text-white dark:bg-error/80";
      case DayStatus.SPECIAL_EVENT:
        return "border-transparent bg-info text-white dark:bg-info/80";
      case DayStatus.WORKING_DAY:
        return "border-transparent bg-warning text-white dark:bg-warning/80";
      default:
        return "border-transparent bg-success text-white dark:bg-success/80";
    }
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-3 border-b border-border pb-2">
      {/* Date */}
      <div
        className={`h-10 w-10 shrink-0 rounded-lg flex flex-col items-center justify-center font-bold ${getStyleForEvent(event.day_status)}`}
      >
        <p className="text-xs font-semibold">
          {getMonthName(event.start_date)}
        </p>
        <p className="text-xs font-semibold">{getDay(event.start_date)}</p>
      </div>

      {/* Event content */}
      <div className="min-w-0 flex-1 break-all">
        <HoverCard>
          <HoverCardTrigger asChild>
            <p className="truncate cursor-pointer font-semibold">
              {event.title}
            </p>
          </HoverCardTrigger>

          <HoverCardContent
            side="top"
            className="max-w-xs bg-popover text-popover-foreground shadow-lg"
          >
            <p className="text-xs break-words">{event.title}</p>
          </HoverCardContent>
        </HoverCard>

        {event.description && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <p className="truncate cursor-pointer text-xs text-muted-foreground">
                {event.description}
              </p>
            </HoverCardTrigger>

            <HoverCardContent
              side="top"
              className="max-w-xs bg-popover text-popover-foreground shadow-lg"
            >
              <p className="text-xs break-words">{event.description}</p>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>

      {/* Badge */}
      <div className="ml-auto shrink-0">
        {getBadge(event.day_status, event.day_status.replaceAll("_", " "))}
      </div>
    </div>
  );
}
