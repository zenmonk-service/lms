import EventManagement from "@/components/event-management";
import { EventsProvider } from "@/context/events-context";

const OrganizationEventManagement = () => {
  return (
    <EventsProvider>
      <EventManagement />
    </EventsProvider>
  );
};

export default OrganizationEventManagement;
