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
import { LoaderCircle, PlusIcon } from "lucide-react";
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
import { hasPermissions } from "@/lib/haspermissios";

const eventAddFormSchema = z
  .object({
    title: z
      .string({ message: "Please enter a title." })
      .trim()
      .min(1, { message: "Must provide a title for this event." })
      .max(255, { message: "Title must be 255 characters or fewer." }),
    description: z.string().trim().optional(),
    start: z.date({ message: "Please select a valid start time" }),
    end: z.date({ message: "Please select a valid end time" }),
    day_status: z.enum(Object.values(DayStatus)),
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
    (state) => state.organizationsSlice,
  );
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof eventAddFormSchema>>({
    resolver: zodResolver(eventAddFormSchema),
  });

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      day_status: DayStatus.SPECIAL_EVENT,
      start: start,
      end: end,
    });
  }, [form, start, end]);

  async function onSubmit(data: EventAddFormValues) {
    const payload = {
      title: data.title,
      description: data.description || "",
      day_status: data.day_status,
      start_date: data.start,
      end_date: data.end,
    };

    try {
      await dispatch(
        createOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
          payload,
        }),
      );
      await dispatch(
        getOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
          year: data.start.getFullYear(),
        }),
      );
      const today = new Date();
      form.reset({
        title: "",
        description: "",
        day_status: DayStatus.SPECIAL_EVENT,
        start: today,
        end: today,
      });
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
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Team event"
                      maxLength={255}
                      {...field}
                    />
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
              render={({ field }) => {
                const hasPermission = hasPermissions(
                  "organization_holiday_management",
                  "create",
                  currentUserRolePermissions,
                  currentUser.email,
                );

                let filteredDayStatus = Object.values(DayStatus).filter(
                  (s) => s !== DayStatus.PUBLIC_HOLIDAY,
                );

                if (!hasPermission) {
                  filteredDayStatus = filteredDayStatus.filter(
                    (s) => s !== DayStatus.ORGANIZATION_HOLIDAY,
                  );
                }

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel htmlFor="day_status">
                      Day Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {filteredDayStatus.map((status) => (
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
                );
              }}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">
                    Start <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={24}
                      granularity="second"
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
                  <FormLabel htmlFor="datetime">
                    End <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={24}
                      granularity="second"
                      isEndTime={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel
                onClick={() => {
                  const today = new Date();
                  form.reset({
                    title: "",
                    description: "",
                    day_status: DayStatus.SPECIAL_EVENT,
                    start: today,
                    end: today,
                  });
                  setEventAddOpen(false);
                }}
              >
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
