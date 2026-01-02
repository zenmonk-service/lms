import { DayStatus } from "@/features/organizations/organizations.type";
import FullCalendar from "@fullcalendar/react";
import { RefObject } from "react";

export type calendarRef = RefObject<FullCalendar | null>;

export interface OrganizationEvents {
  uuid: string;
  title: string;
  description?: string;
  day_status: DayStatus;
  start_date: Date;
  end_date: Date;
}

export const earliestTime = 540;
export const latestTime = 1320;

export const months = [
  {
    value: "1",
    label: "January",
  },
  {
    value: "2",
    label: "February",
  },
  {
    value: "3",
    label: "March",
  },
  {
    value: "4",
    label: "April",
  },
  {
    value: "5",
    label: "May",
  },
  {
    value: "6",
    label: "June",
  },
  {
    value: "7",
    label: "July",
  },
  {
    value: "8",
    label: "August",
  },
  {
    value: "9",
    label: "September",
  },
  {
    value: "10",
    label: "October",
  },
  {
    value: "11",
    label: "November",
  },
  {
    value: "12",
    label: "December",
  },
];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  day_status: DayStatus;
  description: string;
}
