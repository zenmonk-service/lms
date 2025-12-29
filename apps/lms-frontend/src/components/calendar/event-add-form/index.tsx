"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LoaderCircle, PlusIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
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
import { DateTimePicker } from "../date-picker";
import { DayStatus } from "@/features/organizations/organizations.type";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createOrganizationEventAction,
  getOrganizationEventAction,
} from "@/features/organizations/organizations.action";
import { toastError } from "@/shared/toast/toast-error";
import z from "zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const eventAddFormSchema = z
  .object({
    title: z
      .string({ message: "Please enter a title." })
      .min(1, { message: "Must provide a title for this event." }),
    description: z.string().optional(),
    start: z.date({ message: "Please select a valid start time" }),
    end: z.date({ message: "Please select a valid end time" }),
    day_status: z.enum(Object.values(DayStatus)),
    color: z
      .string({ message: "Please select an event color." })
      .min(1, { message: "Must provide a color for this event." }),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be after start time.",
    path: ["end"],
  });

type EventAddFormValues = z.infer<typeof eventAddFormSchema>;

interface EventAddFormProps {
  start: Date;
  end: Date;
}

export function EventAddForm({ start, end }: EventAddFormProps) {
  const { eventAddOpen, setEventAddOpen } = useEvents();

  const { isLoading, currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof eventAddFormSchema>>({
    resolver: zodResolver(eventAddFormSchema),
  });

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      day_status: DayStatus.ORGANIZATION_HOLIDAY,
      start: start,
      end: end,
      color: "#76c7ef",
    });
  }, [form, start, end]);

  async function onSubmit(data: EventAddFormValues) {
    const payload = {
      title: data.title,
      description: data.description || "",
      day_status: data.day_status,
      start_date: data.start,
      end_date: data.end,
      band_color: data.color,
    };

    try {
      await dispatch(
        createOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
          payload,
        })
      );
      await dispatch(
        getOrganizationEventAction({ org_uuid: currentOrganization.uuid })
      );
      setEventAddOpen(false);
      toast.success("Event added!");
    } catch (err) {
      toastError("Failed to add event. Please try again.");
    }
  }

  return (
    <AlertDialog open={eventAddOpen}>
      <AlertDialogTrigger className="flex" asChild>
        <Button
          className="w-24 md:w-28 text-xs md:text-sm"
          variant="default"
          onClick={() => setEventAddOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
          )}
          <p>Add Event</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Event</AlertDialogTitle>
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
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild className="cursor-pointer">
                        <div className="flex flex-row w-full items-center space-x-2 pl-2">
                          <div
                            className={`w-5 h-5 rounded-full cursor-pointer`}
                            style={{ backgroundColor: field.value }}
                          ></div>
                          <Input {...field} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="flex mx-auto items-center justify-center">
                        <HexColorPicker
                          className="flex"
                          color={field.value}
                          onChange={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel onClick={() => setEventAddOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Add Event"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
