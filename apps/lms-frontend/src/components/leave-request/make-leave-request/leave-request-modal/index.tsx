import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { getLeaveTypesAction } from "@/features/leave-types/leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import {
  createUserLeaveRequestsAction,
  getUserLeaveRequestsAction,
  updateLeaveRequestOfUserAction,
} from "@/features/leave-requests/leave-requests.action";
import {
  LeaveRange,
  LeaveRequestType,
} from "@/features/leave-requests/leave-requests.types";
import { listUserAction } from "@/features/user/user.action";
import { DateRangePicker } from "@/shared/date-range-picker";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import CustomSelect from "@/shared/select";
import { LoaderCircle } from "lucide-react";
import { getSession } from "@/app/auth/get-auth.action";
import { UserInterface } from "@/features/user/user.slice";
import InfiniteScroll from "react-infinite-scroll-component";

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  data?: any;
  leave_request_uuid?: string;
}

const allowedRanges: Record<string, string[]> = {
  [LeaveRequestType.FULL_DAY]: [LeaveRange.FULL_DAY],
  [LeaveRequestType.HALF_DAY]: [LeaveRange.FIRST_HALF, LeaveRange.SECOND_HALF],
  [LeaveRequestType.SHORT_LEAVE]: [
    LeaveRange.FIRST_QUARTER,
    LeaveRange.SECOND_QUARTER,
    LeaveRange.THIRD_QUARTER,
    LeaveRange.FOURTH_QUARTER,
  ],
};

const allowedTypes: Record<string, string[]> = {
  same_day: [
    LeaveRequestType.FULL_DAY,
    LeaveRequestType.HALF_DAY,
    LeaveRequestType.SHORT_LEAVE,
  ],
  multiple_days: [LeaveRequestType.FULL_DAY],
};

const leaveRequestSchema = z
  .object({
    leave_type_uuid: z
      .string()
      .trim()
      .nonempty({ error: "Please select a leave." }),
    type: z.string().nonempty({ error: "Please select a leave type." }),
    range: z.string().nonempty({ error: "Please select a leave range." }),
    managers: z
      .array(z.string())
      .min(1, "Atleast one manager needs to be selected."),
    reason: z
      .string()
      .trim()
      .max(255, "Reason must be at most 255 characters long")
      .optional(),
    date_range: z.object({
      start_date: z.string().nonempty({ error: "Date range is required." }),
      end_date: z.string().nonempty({ error: "Date range is required." }),
    }),
  })
  .refine(
    (data) => {
      if (!data.date_range.start_date || !data.date_range.end_date) {
        return true;
      }

      const startDate = new Date(data.date_range.start_date);
      const endDate = new Date(data.date_range.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false;
      }

      return startDate <= endDate;
    },
    {
      message: "End date must be after or equal to start date.",
      path: ["date_range"],
    }
  );

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export function LeaveRequestModal({
  open,
  onOpenChange,
  onClose,
  data,
  leave_request_uuid,
}: LeaveRequestModalProps) {
  const { leaveTypes } = useAppSelector((state) => state.leaveTypeSlice);
  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid
  );
  const {
    users,
    isLoading: isUsersLoading,
    total,
    currentPage,
    currentUser,
  } = useAppSelector((state) => state.userSlice);
  const { isLoading } = useAppSelector((state) => state.leaveRequestSlice);
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type_uuid: "",
      reason: "",
      managers: [],
      date_range: { start_date: "", end_date: "" },
      type: "",
      range: "",
    },
  });

  const dateRange = watch("date_range");
  const type = watch("type");

  const [session, setSession] = useState<any>(null);

  async function getUserUuid() {
    const session = await getSession();
    setSession(session);
  }

  useEffect(() => {
    getUserUuid();
    dispatch(getLeaveTypesAction({ org_uuid: currentOrganizationUuid }));
    dispatch(getOrganizationRolesAction({ org_uuid: currentOrganizationUuid }));
  }, []);

  useEffect(() => {
    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid: currentOrganizationUuid,
      })
    );
  }, [searchTerm]);

  useEffect(() => {
    if (open) {
      reset({
        leave_type_uuid: data?.leave_type?.uuid ?? "",
        type: data?.type ?? "",
        range: data?.range ?? "",
        managers: (data?.managers || []).map((m: any) => m.user.user_id),
        reason: data?.reason ?? "",
        date_range: {
          start_date: data?.start_date ?? "",
          end_date: data?.end_date ?? "",
        },
      });
    }
  }, [open]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const typeOptions = useMemo(() => {
    const start = new Date(dateRange.start_date);
    const end = new Date(dateRange.end_date);

    const diffTime = Math.abs(end.getTime() - start.getTime());

    const key = diffTime === 0 ? "same_day" : "multiple_days";
    return allowedTypes[key];
  }, [dateRange]);

  const onSubmit = async (data: LeaveRequestFormData) => {
    const dateRange = data.date_range;
    data = { ...data, ...dateRange };
    if (session) {
      if (leave_request_uuid) {
        await dispatch(
          updateLeaveRequestOfUserAction({
            org_uuid: currentOrganizationUuid,
            user_uuid: session.user.uuid,
            leave_request_uuid,
            ...data,
          })
        );
      } else {
        await dispatch(
          createUserLeaveRequestsAction({
            org_uuid: currentOrganizationUuid,
            user_uuid: session?.user?.uuid,
            ...data,
          })
        );
      }

      await dispatch(
        getUserLeaveRequestsAction({
          org_uuid: currentOrganizationUuid,
          user_uuid: session?.user?.uuid,
        })
      );
      reset();
      onClose();
    }
  };

  const leavesForCurrentUser = useMemo(() => {
    const activeLeaves = leaveTypes.rows.filter((lt) => lt.is_active);
    return activeLeaves.filter((leave) =>
      leave.applicable_for.value.includes(currentUser.role.uuid)
    );
  }, [currentUser, leaveTypes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Fill in the form below to request leave.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 overflow-y-auto max-h-96 no-scrollbar py-2">
            <div className="grid gap-3">
              <Controller
                name="leave_type_uuid"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>Leave Type</FieldLabel>
                    <CustomSelect
                      ref={field.ref}
                      value={field.value}
                      onValueChange={field.onChange}
                      data={leavesForCurrentUser}
                      label="Leaves"
                      placeholder="Select a leave"
                      className={
                        fieldState.invalid
                          ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                          : ""
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-3">
              <Controller
                name="date_range"
                control={control}
                render={({ field, fieldState }) => {
                  const hasError =
                    fieldState.invalid ||
                    errors.date_range?.start_date ||
                    errors.date_range?.end_date;
                  return (
                    <Field className="gap-1">
                      <FieldLabel>Date Range</FieldLabel>
                      <DateRangePicker
                        ref={field.ref}
                        minDate={today}
                        setDateRange={field.onChange}
                        initialStartDate={data?.start_date}
                        initialEndDate={data?.end_date}
                        className={
                          fieldState.invalid
                            ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                            : ""
                        }
                        onReset={() => {
                          setValue("type", "");
                          setValue("range", "");
                        }}
                      />
                      {hasError && (
                        <FieldError
                          errors={[
                            {
                              message:
                                errors.date_range?.start_date?.message ||
                                errors.date_range?.end_date?.message ||
                                fieldState.error?.message,
                            },
                          ]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="grid gap-3">
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>Type</FieldLabel>
                      <CustomSelect
                        ref={field.ref}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("range", "");
                        }}
                        data={typeOptions}
                        label="Leave Type"
                        placeholder="Select leave type"
                        className={
                          fieldState.invalid
                            ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                            : ""
                        }
                        disabled={!dateRange.start_date || !dateRange.end_date}
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Controller
                  name="range"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>Range</FieldLabel>
                      <CustomSelect
                        ref={field.ref}
                        value={field.value}
                        onValueChange={field.onChange}
                        data={allowedRanges[type as LeaveRequestType] ?? []}
                        label="Leave Range"
                        placeholder="Select leave range"
                        className={
                          fieldState.invalid
                            ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                            : ""
                        }
                        disabled={type == ""}
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Controller
                name="managers"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1 col-span-2">
                    <FieldLabel>Apply To</FieldLabel>
                    <MultiSelect
                      values={field.value}
                      onValuesChange={field.onChange}
                    >
                      <MultiSelectTrigger
                        ref={field.ref}
                        className={`w-full hover:bg-transparent ${
                          fieldState.invalid
                            ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                            : ""
                        }`}
                      >
                        <MultiSelectValue
                          overflowBehavior="cutoff"
                          placeholder="Select managers..."
                        />
                      </MultiSelectTrigger>
                      <MultiSelectContent
                        search={{
                          emptyMessage: "No managers found.",
                          placeholder: "Search managers...",
                        }}
                        onSearch={setSearchTerm}
                        isLoading={isUsersLoading}
                      >
                        <MultiSelectGroup>
                          <InfiniteScroll
                            dataLength={users.length}
                            next={() => {
                              dispatch(
                                listUserAction({
                                  pagination: {
                                    page: currentPage + 1,
                                    limit: 10,
                                    search: searchTerm,
                                  },
                                  org_uuid: currentOrganizationUuid,
                                  isInfiniteScroll: true,
                                })
                              );
                            }}
                            hasMore={users.length < total}
                            loader={
                              <LoaderCircle className="animate-spin mx-auto my-2" />
                            }
                            height={100}
                          >
                            {users
                              .filter(
                                (manager) =>
                                  manager.user_id !== session?.user?.uuid
                              )
                              .map((manager: UserInterface) => (
                                <MultiSelectItem
                                  value={manager.user_id}
                                  key={manager.user_id}
                                >
                                  {manager.name}
                                </MultiSelectItem>
                              ))}
                          </InfiniteScroll>
                        </MultiSelectGroup>
                      </MultiSelectContent>
                    </MultiSelect>
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-3">
              <Controller
                name="reason"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1 truncate">
                    <FieldLabel htmlFor="form-rhf-demo-reason">
                      Reason
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-reason"
                        placeholder="I'm requesting leave because..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                        maxLength={255}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field?.value?.length || 0}/255 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Briefly describe why you are requesting this leave.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className=" text-white">
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Request Leave"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
