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
import { getOrganizationRolesAction } from "@/features/role/role.action";
import { listUserAction } from "@/features/user/user.action";
import { DateRangePicker } from "@/shared/date-range-picker";
import CustomSelect from "@/shared/select";
import { LoaderCircle } from "lucide-react";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";
import { createUserLeaveRequestAction } from "@/features/leave/create-user-leave-request/create-user-leave-request.action";
import { updateUserLeaveRequestAction } from "@/features/leave/update-user-leave-request/update-user-leave-request.action";
import { LeaveRange, LeaveRequestType } from "@/features/leave/leave.types";
import { LeaveRequestFormData, leaveRequestSchema } from "../../leave.types";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";

interface IProps {
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

export function LeaveRequestModal({
  open,
  onOpenChange,
  onClose,
  data,
  leave_request_uuid,
}: IProps) {
  const {
    users,
    isLoading: isUsersLoading,
    total,
    currentPage,
    currentUser,
  } = useAppSelector((state) => state.userSlice);
  const { isLoading } = useAppSelector((state) => state.leaveSlice);
  const { leaveTypes, isLoading: isLeaveTypesLoading } = useAppSelector((state) => state.leaveTypeSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);

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

  const type = watch("type");

  useEffect(() => {
    dispatch(getLeaveTypesAction({ org_uuid: currentOrganizationUuid }));
    dispatch(getOrganizationRolesAction({ org_uuid: currentOrganizationUuid }));
  }, []);

  useEffect(() => {
    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid: currentOrganizationUuid,
      }),
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

  const onSubmit = async (data: LeaveRequestFormData) => {
    const dateRange = data.date_range;
    data = { ...data, ...dateRange };
    if (leave_request_uuid) {
      await dispatch(
        updateUserLeaveRequestAction({
          org_uuid: currentOrganizationUuid,
          user_uuid: currentUser.user_id,
          leave_request_uuid,
          ...data,
        }),
      );
    } else {
      await dispatch(
        createUserLeaveRequestAction({
          org_uuid: currentOrganizationUuid,
          user_uuid: currentUser.user_id,
          ...data,
        }),
      );
    }

    await dispatch(
      listUserLeaveRequestsAction({
        org_uuid: currentOrganizationUuid,
        user_uuid: currentUser.user_id,
      }),
    );
    reset();
    onClose();
  };

  const leavesForCurrentUser = useMemo(() => {
    const activeLeaves = leaveTypes.rows.filter((lt) => lt.is_active);
    return activeLeaves.filter((leave) => {
      const idKey =
        leave.applicable_for.type === "employee" ? "user_id" : "uuid";
      const user =
        leave.applicable_for.type === "employee"
          ? currentUser.user_id
          : currentUser.role.uuid;
      return leave.applicable_for.value.some((v) => v[idKey] === user);
    });
  }, [currentUser, leaveTypes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Fill in the form below to request leave.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 overflow-y-auto no-scrollbar py-2 max-h-96 sm:max-h-full">
            <div className="grid gap-3">
              <Controller
                name="leave_type_uuid"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>
                      Leave Type <span className="text-destructive">*</span>
                    </FieldLabel>
                    <CustomSelect
                      ref={field.ref}
                      value={field.value}
                      aria-invalid={fieldState.invalid}
                      onValueChange={field.onChange}
                      getValue={(item) => item.uuid}
                      getLabel={(item) => item.name}
                      data={leavesForCurrentUser}
                      isLoading={isLeaveTypesLoading}
                      label="Leaves"
                      placeholder="Select a leave"
                      emptyMessage="No leave type found"
                      className="w-full"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="grid gap-3">
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>
                        Type <span className="text-destructive">*</span>
                      </FieldLabel>
                      <CustomSelect
                        ref={field.ref}
                        aria-invalid={fieldState.invalid}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("range", "");
                        }}
                        getValue={(item) => item}
                        getLabel={(item) => item.replace("_", " ").slice(0, 1).toUpperCase() + item.replace("_", " ").slice(1).toLowerCase()}
                        data={Object.values(LeaveRequestType)}
                        label="Leave Type"
                        placeholder="Select leave type"
                        className="w-full"
                      />
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
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
                      <FieldLabel>
                        Range <span className="text-destructive">*</span>
                      </FieldLabel>
                      <CustomSelect
                        ref={field.ref}
                        aria-invalid={fieldState.invalid}
                        value={field.value}
                        onValueChange={field.onChange}
                        data={allowedRanges[type as LeaveRequestType] || []}
                        getValue={(item) => item}
                        getLabel={(item) => item.replace("_", " ").slice(0, 1).toUpperCase() + item.replace("_", " ").slice(1).toLowerCase()}
                        label="Leave Range"
                        placeholder="Select leave range"
                        className="w-full"
                        disabled={type === ""}
                      />

                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Controller
                name="date_range"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-1">
                      <FieldLabel>
                        Date Range <span className="text-destructive">*</span>
                      </FieldLabel>
                      <DateRangePicker
                        ref={field.ref}
                        minDate={today}
                        type={type}
                        setDateRange={field.onChange}
                        initialStartDate={data?.start_date}
                        initialEndDate={data?.end_date}
                        maxDays={60}
                        className={
                          fieldState.invalid
                            ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                            : ""
                        }
                        disabled={type === ""}
                      />

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
                    </Field>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Controller
                name="managers"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1 col-span-2">
                    <FieldLabel>
                      Apply To <span className="text-destructive">*</span>
                    </FieldLabel>
                    <InfiniteMultiSelect
                      ref={field.ref}
                      ariaInvalid={fieldState.invalid}
                      value={field.value}
                      onValuesChange={field.onChange}
                      data={users.filter((manager) => manager.user_id !== currentUser.user_id)}
                      total={total}
                      isLoading={isUsersLoading}
                      onSearch={setSearchTerm}
                      onLoadMore={async () =>
                        await dispatch(
                          listUserAction({
                            pagination: {
                              page: currentPage + 1,
                              limit: 10,
                              search: searchTerm,
                            },
                            org_uuid: currentOrganizationUuid,
                            isInfiniteScroll: true,
                          }),
                        )
                      }
                      placeholder="Select managers..."
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
            <Button type="submit" disabled={isLoading}>
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
