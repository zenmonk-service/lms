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
    (state) => state.organizationsSlice || { organizationEvents: [] }
  );

  const mapOrgEventsToCalendar = (
    orgEvents: OrganizationEvents[] = []
  ): CalendarEvent[] => {
    return orgEvents.map((e) => ({
      id: String(e.uuid),
      title: e.title,
      description: e.description ?? "",
      backgroundColor: e.band_color,
      day_status: e.day_status,
      start: e.start_date,
      end: e.end_date,
    }));
  };

  useEffect(() => {
    if (organizationEvents && organizationEvents.length > 0) {
      setEvents(mapOrgEventsToCalendar(organizationEvents));
    } else {
      setEvents([]);
    }
  }, [organizationEvents]);

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
