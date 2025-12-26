import Calendar from "@/components/calendar";
import { EventsProvider } from "@/context/events-context";

const CalendarPage = () => {
  return (
    <EventsProvider>
      <Calendar />
    </EventsProvider>
  );
};

export default CalendarPage;
