"use client";

import { useEvents } from "@/context/events-context";
import { useSidebar } from "@/components/ui/sidebar";
import "./calendar.css";
import {
  DateSelectArg,
  DayCellContentArg,
  DayHeaderContentArg,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRef, useState, useEffect } from "react";
import { CalendarEvent, earliestTime, latestTime } from "@/utils/data";
import { getDateFromMinutes } from "@/lib/utils";
import CalendarNav from "./components/calendar-nav";
import { Card } from "@/components/ui/card";
import { EventView } from "./components/event-view";
import { EventEditForm } from "./components/event-edit-form";
import { useAppDispatch, useAppSelector } from "@/store";
import { getOrganizationEventAction } from "@/features/organizations/organizations.action";
import { CalendarSkeleton } from "./components/skeleton";
import { getPublicHolidaysAction } from "@/features/holidays/holidays.action";
import { Dot } from "lucide-react";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";
import { DayStatus } from "@/features/organizations/organizations.type";
import Title from "@/shared/typography/title";

type EventItemProps = {
  info: EventContentArg;
};

type DayHeaderProps = {
  info: DayHeaderContentArg;
};

type DayRenderProps = {
  info: DayCellContentArg;
};

export default function EventManagement() {
  const { state } = useSidebar();
  const { events, setEventAddOpen, setEventEditOpen, setEventViewOpen } = useEvents();

  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);

  const dispatch = useAppDispatch();

  const calendarRef = useRef<FullCalendar | null>(null);
  
  const [isDrag, setIsDrag] = useState(false);
  const [viewedDate, setViewedDate] = useState(new Date());
  const [selectedEnd, setSelectedEnd] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(new Date());
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [selectedOldEvent, setSelectedOldEvent] = useState<CalendarEvent | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  const getData = async () => {
    try {
      setIsCalendarLoading(true);
      const year = new Date().getFullYear();
      await dispatch(getOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
          year,
        }),
      );
      await dispatch(getPublicHolidaysAction());
    } catch (err) {
    } finally {
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 250);

    return () => clearTimeout(timer);
  }, [state]);

  const handleDateClick = (info: DateClickArg) => {
    if (info.allDay && info.view.type === "timeGridWeek") return;

    const hasPermission = hasPermissions(
      "organization_event_management",
      "create",
      currentUserRolePermissions,
      currentUser.email,
    );
    if (hasPermission) setEventAddOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      backgroundColor: info.event.backgroundColor,
      day_status: info.event.extendedProps.day_status,
      start: info.event.start!,
      end: info.event.end!,
    };

    setIsDrag(false);
    setSelectedOldEvent(event);
    setSelectedEvent(event);
    setEventViewOpen(true);
  };

  const handleEventChange = (info: EventChangeArg) => {
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      backgroundColor: info.event.backgroundColor,
      day_status: info.event.extendedProps.day_status,
      start: info.event.start!,
      end: info.event.end!,
    };

    const oldEvent: CalendarEvent = {
      id: info.oldEvent.id,
      title: info.oldEvent.title,
      description: info.oldEvent.extendedProps.description,
      backgroundColor: info.oldEvent.backgroundColor,
      day_status: info.oldEvent.extendedProps.day_status,
      start: info.oldEvent.start!,
      end: info.oldEvent.end!,
    };

    setIsDrag(true);
    setSelectedOldEvent(oldEvent);
    setSelectedEvent(event);
    setEventEditOpen(true);
  };

  const EventItem = ({ info }: EventItemProps) => {
    const { event } = info;
    const isOrgHoliday =
      event.extendedProps.day_status === DayStatus.ORGANIZATION_HOLIDAY;
    const [left, right] = info.timeText.split(" - ");
    const hasTimeRange = Boolean(info.timeText) && !event.allDay;

    return (
      <>
        {isOrgHoliday ? (
          hasPermissions(
            "organization_holiday_management",
            "read",
            currentUserRolePermissions,
            currentUser.email,
          ) && (
            <div className="overflow-hidden w-full">
              {info.view.type == "dayGridMonth" ? (
                <div
                  style={{
                    backgroundColor: `var(--color${event.backgroundColor})`,
                  }}
                  className={`flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
                >
                  <p className="font-semibold line-clamp-1 w-11/12">
                    {event.title}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: `var(--color${event.backgroundColor})`,
                  }}
                  className="flex flex-col space-y-0 text-[0.5rem] sm:text-[0.6rem] md:text-xs h-full px-2"
                >
                  <p className="font-semibold w-full line-clamp-1">
                    {event.title}
                  </p>
                  {hasTimeRange && (
                    <p className="line-clamp-1">{`${left} - ${right}`}</p>
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="overflow-hidden w-full">
            {info.view.type == "dayGridMonth" ? (
              <div
                style={{
                  backgroundColor: `var(--color${event.backgroundColor})`,
                }}
                className={`flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
              >
                <p className="font-semibold line-clamp-1 w-11/12">
                  {event.title}
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: `var(--color${event.backgroundColor})`,
                }}
                className="flex flex-col space-y-0 text-[0.5rem] sm:text-[0.6rem] md:text-xs h-full px-2"
              >
                <p className="font-semibold w-full line-clamp-1">
                  {event.title}
                </p>
                {hasTimeRange && (
                  <p className="line-clamp-1">{`${left} - ${right}`}</p>
                )}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const DayHeader = ({ info }: DayHeaderProps) => {
    const [weekday] = info.text.split(" ");

    return (
      <div className="flex items-center h-full overflow-hidden">
        {info.view.type == "timeGridDay" ? (
          <div className="flex flex-col rounded-sm">
            <p>
              {info.date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ) : info.view.type == "timeGridWeek" ? (
          <div className="flex flex-col space-y-0.5 rounded-sm items-center w-full text-xs sm:text-sm md:text-md">
            <p className="flex font-semibold">{weekday}</p>
            {info.isToday ? (
              <div className="flex bg-black dark:bg-white h-6 w-6 rounded-full items-center justify-center text-xs sm:text-sm md:text-md">
                <p className="font-light dark:text-black text-white">
                  {info.date.getDate()}
                </p>
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full items-center justify-center">
                <p className="font-light">{info.date.getDate()}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col rounded-sm">
            <p>{weekday}</p>
          </div>
        )}
      </div>
    );
  };

  const DayRender = ({ info }: DayRenderProps) => {
    return (
      <div className="flex">
        {info.view.type == "dayGridMonth" && info.isToday ? (
          <div className="flex h-7 w-7 rounded-full bg-black dark:bg-white items-center justify-center text-sm text-white dark:text-black">
            {info.dayNumberText}
          </div>
        ) : (
          <div className="flex h-7 w-7 rounded-full items-center justify-center text-sm">
            {info.dayNumberText}
          </div>
        )}
      </div>
    );
  };

  const handleDateSelect = (info: DateSelectArg) => {
    if (info.allDay && info.view.type === "timeGridWeek") return;

    const hasPermission = hasPermissions(
      "organization_event_management",
      "create",
      currentUserRolePermissions,
      currentUser.email,
    );

    if (!hasPermission) return;

    const currentView = calendarRef.current?.getApi().view.type;
    const isSingleDay =
      info.end &&
      info.start &&
      info.end.getTime() - info.start.getTime() === 24 * 60 * 60 * 1000;

    let end = info.end;
    if (currentView === "dayGridMonth") {
      if (isSingleDay) {
        end = new Date(info.start);
      } else {
        end =
          info.end.getDate() > 1 ? new Date(info.end.getTime() - 1) : info.end;
      }
      end.setHours(23, 59, 59, 999);
    }

    setSelectedStart(info.start);
    setSelectedEnd(end);
    setEventAddOpen(true);
  };

  const earliestHour = getDateFromMinutes(earliestTime)
    .getHours()
    .toString()
    .padStart(2, "0");
  const earliestMin = getDateFromMinutes(earliestTime)
    .getMinutes()
    .toString()
    .padStart(2, "0");
  const latestHour = getDateFromMinutes(latestTime)
    .getHours()
    .toString()
    .padStart(2, "0");
  const latestMin = getDateFromMinutes(latestTime)
    .getMinutes()
    .toString()
    .padStart(2, "0");

  const calendarEarliestTime = `${earliestHour}:${earliestMin}`;
  const calendarLatestTime = `${latestHour}:${latestMin}`;

  return (
    <div className="w-full p-6 md:py-6 md:w-11/12 mx-auto">
      <Title
        title={{
          text: "Organization Event Management",
          className: "",
        }}
        description={{
          text: "Manage your organization events, holidays, and special occasions all in one place.",
          className: "",
        }}
        className=""
      />
      <div className="space-y-3">
        <CalendarNav
          calendarRef={calendarRef}
          start={selectedStart}
          end={selectedEnd}
          viewedDate={viewedDate}
        />

        <div className="flex gap-2 mb-3">
          <div className="flex items-center">
            <Dot strokeWidth={8} className="text-(--color-error)" />
            <span className="text-sm">Public Holiday</span>
          </div>
          <div className="flex items-center">
            <Dot strokeWidth={8} className="text-(--color-success)" />
            <span className="text-sm">Organization Holiday</span>
          </div>
          <div className="flex items-center">
            <Dot strokeWidth={8} className="text-(--color-info)" />
            <span className="text-sm">Special Event</span>
          </div>
          <div className="flex items-center">
            <Dot strokeWidth={8} className="text-(--color-warning)" />
            <span className="text-sm">Working Day</span>
          </div>
        </div>
      </div>

      {hasPermissions(
        "organization_event_management",
        "read",
        currentUserRolePermissions,
        currentUser.email,
      ) ? (
        <>
          {isCalendarLoading ? (
            <CalendarSkeleton />
          ) : (
            <Card className="p-3">
              <FullCalendar
                ref={calendarRef}
                timeZone="local"
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  multiMonthPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={false}
                slotMinTime={calendarEarliestTime}
                slotMaxTime={calendarLatestTime}
                allDaySlot={true}
                allDayText=""
                firstDay={1}
                height={"32vh"}
                displayEventEnd={true}
                windowResizeDelay={0}
                events={events}
                slotLabelFormat={{
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }}
                eventTimeFormat={{
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }}
                eventBorderColor={"black"}
                contentHeight={"auto"}
                expandRows={true}
                dayCellContent={(dayInfo) => <DayRender info={dayInfo} />}
                eventContent={(eventInfo) => <EventItem info={eventInfo} />}
                dayHeaderContent={(headerInfo) => (
                  <DayHeader info={headerInfo} />
                )}
                eventClick={(eventInfo) => handleEventClick(eventInfo)}
                eventChange={(eventInfo) => handleEventChange(eventInfo)}
                select={handleDateSelect}
                datesSet={(dates) => setViewedDate(dates.view.currentStart)}
                dateClick={(dateInfo) => handleDateClick(dateInfo)}
                nowIndicator
                selectable
              />
            </Card>
          )}
          <EventEditForm
            oldEvent={selectedOldEvent}
            event={selectedEvent}
            isDrag={isDrag}
            displayButton={false}
          />
          <EventView event={selectedEvent} />
        </>
      ) : (
        <NoPermission moduleName="Event Management" />
      )}
    </div>
  );
}
