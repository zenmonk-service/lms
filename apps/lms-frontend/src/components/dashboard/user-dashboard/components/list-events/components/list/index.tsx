import {
  DayStatus,
  OrganizationEvents,
} from "@/features/organizations/organizations.types";
import { getBadge } from "@/utils/badge/get-badge";
import React from "react";

interface IProps {
  event: OrganizationEvents;
}

const ListIndividualEvent = ({ event }: IProps) => {
  const getMonthName = (date: string) => {
    const monthIndex = new Date(date).getMonth();
    return new Date(0, monthIndex).toLocaleString("en-US", { month: "short" });
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
    <div className="border-b border-border pb-2 flex gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-border font-bold ${getStyleForEvent(event.day_status)}`}
      >
        <p className="font-semibold text-xs">
          {getMonthName(event.start_date)}
        </p>
        <p className="font-semibold text-xs">{getDay(event.start_date)}</p>
      </div>

      <div className="flex-1">
        <p className="font-semibold">{event.title}</p>
        {event.description && (
          <p className="text-xs max-w-xs truncate wrap-break-word">
            {event.description}
          </p>
        )}
      </div>

      <div className="ml-auto">
        {getBadge(event.day_status, event.day_status.replaceAll("_", " "))}
      </div>
    </div>
  );
};

export default ListIndividualEvent;
