"use client";
import { CalendarEvent, OrganizationEvents } from "@/utils/data";
import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAppSelector } from "@/store";
import { DayStatus } from "@/features/organizations/organizations.type";

interface EventsContextType {
  events: CalendarEvent[];
  eventViewOpen: boolean;
  setEventViewOpen: (value: boolean) => void;
  eventAddOpen: boolean;
  setEventAddOpen: (value: boolean) => void;
  eventEditOpen: boolean;
  setEventEditOpen: (value: boolean) => void;
  eventDeleteOpen: boolean;
  setEventDeleteOpen: (value: boolean) => void;
  availabilityCheckerEventAddOpen: boolean;
  setAvailabilityCheckerEventAddOpen: (value: boolean) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

export const EventsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const { organizationEvents } = useAppSelector(
    (state) => state.organizationsSlice
  );

  const { holidays } = useAppSelector((state) => state.holidaysSlice);

  const mapOrgEventsToCalendar = (
    orgEvents: OrganizationEvents[] = []
  ): CalendarEvent[] => {
    return orgEvents.map((e) => ({
      id: String(e.uuid),
      title: e.title,
      description: e.description ?? "",
      backgroundColor:
        e.day_status === DayStatus.ORGANIZATION_HOLIDAY
          ? "-success"
          : e.day_status === DayStatus.SPECIAL_EVENT
            ? "-info"
            : "-warning",
      day_status: e.day_status,
      start: e.start_date,
      end: e.end_date,
    }));
  };

  const mapHolidaysToCalendar = (holidayList: any[] = []): CalendarEvent[] => {
    return holidayList.map((h) => ({
      id: h.uuid,
      title: h.title,
      description: h.description ?? "",
      backgroundColor: "-error",
      day_status: DayStatus.PUBLIC_HOLIDAY,
      start: h.start_date,
      end: h.end_date,
      allDay: true,
    }));
  };

  useEffect(() => {
    const orgEventsMapped = mapOrgEventsToCalendar(organizationEvents || []);
    const holidayEventsMapped = mapHolidaysToCalendar(holidays.rows || []);
    setEvents([...orgEventsMapped, ...holidayEventsMapped]);
  }, [organizationEvents, holidays.rows]);

  const [eventViewOpen, setEventViewOpen] = useState(false);
  const [eventAddOpen, setEventAddOpen] = useState(false);
  const [eventEditOpen, setEventEditOpen] = useState(false);
  const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
  const [availabilityCheckerEventAddOpen, setAvailabilityCheckerEventAddOpen] =
    useState(false);

  return (
    <EventsContext.Provider
      value={{
        events,
        eventViewOpen,
        setEventViewOpen,
        eventAddOpen,
        setEventAddOpen,
        eventEditOpen,
        setEventEditOpen,
        eventDeleteOpen,
        setEventDeleteOpen,
        availabilityCheckerEventAddOpen,
        setAvailabilityCheckerEventAddOpen,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
