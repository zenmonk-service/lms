"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEvents } from "@/context/events-context";
import { CalendarEvent } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "../date-picker";
import { DayStatus } from "@/features/organizations/organizations.type";
import {
  getOrganizationEventAction,
  updateOrganizationEventAction,
} from "@/features/organizations/organizations.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { LoaderCircle, SquarePen } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventEditFormSchema = z
  .object({
    id: z.string(),
    title: z
      .string({ message: "Please enter a title." })
      .min(1, { message: "Must provide a title for this event." }),
    description: z.string().optional(),
    start: z.date({ message: "Please select a valid start time" }),
    end: z.date({ message: "Please select a valid end time" }),
    day_status: z.enum(Object.values(DayStatus)),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be after start time.",
    path: ["end"],
  });

type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

interface EventEditFormProps {
  oldEvent?: CalendarEvent;
  event?: CalendarEvent;
  isDrag: boolean;
  displayButton: boolean;
  color?: string;
}

export function EventEditForm({
  oldEvent,
  event,
  isDrag,
  displayButton,
  color,
}: EventEditFormProps) {
  const { eventEditOpen, setEventEditOpen, setEventViewOpen } = useEvents();

  const { isLoading, currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof eventEditFormSchema>>({
    resolver: zodResolver(eventEditFormSchema),
  });

  const handleEditCancellation = () => {
    if (isDrag && currentOrganization?.uuid) {
      dispatch(
        getOrganizationEventAction({ org_uuid: currentOrganization.uuid })
      );
    }
    setEventEditOpen(false);
  };

  useEffect(() => {
    form.reset({
      id: event?.id,
      title: event?.title,
      description: event?.description,
      start: event?.start as Date,
      end: event?.end as Date,
      day_status: event?.day_status ?? DayStatus.ORGANIZATION_HOLIDAY,
    });
  }, [form, event]);

  async function onSubmit(data: EventEditFormValues) {
    const payload = {
      title: data.title,
      description: data.description || "",
      day_status: data.day_status,
      start_date: data.start,
      end_date: data.end,
    };

    try {
      await dispatch(
        updateOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
          event_uuid: data.id,
          payload,
        })
      );

      await dispatch(
        getOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
        })
      );

      setEventEditOpen(false);
      setEventViewOpen(false);
      toast.success("Event edited!");
    } catch (error) {
      toast.error("Failed to edit event. Please try again.");
    }
  }

  return (
    <AlertDialog open={eventEditOpen}>
      {displayButton && (
        <AlertDialogTrigger asChild>
          <Button
            className="w-full sm:w-24 text-xs md:text-sm mb-1"
            variant="default"
            onClick={() => setEventEditOpen(true)}
          >
            <SquarePen />
            Edit
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit {event?.title}</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Standup Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        placeholder="Describe the event..."
                        rows={4}
                        maxLength={255}
                        className="min-h-16 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value?.length || 0}/255 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="day_status"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="day_status">Day Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(DayStatus)
                            .filter((s) => s !== DayStatus.PUBLIC_HOLIDAY)
                            .map((status) => (
                              <SelectItem key={status} value={status}>
                                {status
                                  .toLowerCase()
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">End</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel onClick={() => handleEditCancellation()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit">
                  {isLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
