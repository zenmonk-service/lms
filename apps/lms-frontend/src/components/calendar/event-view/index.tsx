import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarEvent } from "@/utils/data";
import { useEvents } from "@/context/events-context";
import { AlignLeft, Calendar, Clock, Dot, X } from "lucide-react";
import { EventDeleteForm } from "../event-delete-form";
import { EventEditForm } from "../event-edit-form";
import { DayStatus } from "@/features/organizations/organizations.type";

interface EventViewProps {
  event?: CalendarEvent;
}

export function EventView({ event }: EventViewProps) {
  const { eventViewOpen, setEventViewOpen } = useEvents();

  return (
    <AlertDialog open={eventViewOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex flex-row justify-between items-center">
            <div className="flex gap-1 items-center">
              <Dot
                color={`var(-${event?.backgroundColor})`}
                size={20}
                strokeWidth={12}
              />{" "}
              <p className="font-semibold text-sm text-muted-foreground">
                {event?.day_status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
            <AlertDialogCancel onClick={() => setEventViewOpen(false)}>
              <X className="h-5 w-5" />
            </AlertDialogCancel>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 ">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {" "}
                {event?.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {event?.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {event?.start.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {event?.description && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft size={14} style={{ color: event?.backgroundColor }} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Description
              </span>
            </div>
            <div className="p-5 rounded-sm border">
              <p className="text-sm text-slate-600 leading-[1.6] font-medium">
                {event.description}
              </p>
            </div>
          </div>
        )}
        {event?.day_status === DayStatus.PUBLIC_HOLIDAY ? null : (
          <AlertDialogFooter>
            <EventDeleteForm
              id={event?.id}
              title={event?.title}
              color={event?.backgroundColor}
            />
            <EventEditForm
              oldEvent={event}
              event={event}
              isDrag={false}
              displayButton={true}
              color={event?.backgroundColor}
            />
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
