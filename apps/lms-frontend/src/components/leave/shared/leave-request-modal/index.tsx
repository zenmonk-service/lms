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
import { useAppDispatch, useAppSelector } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DateRangePicker } from "@/shared/date-range-picker";
import CustomSelect from "@/shared/select";
import { LoaderCircle } from "lucide-react";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";
import { createUserLeaveRequestAction } from "@/features/leave/create-user-leave-request/create-user-leave-request.action";
import { updateUserLeaveRequestAction } from "@/features/leave/update-user-leave-request/update-user-leave-request.action";
import {
  LeaveRange,
  LeaveRequestType,
  Managers,
  Row,
} from "@/features/leave/leave.types";
import { LeaveRequestFormData, leaveRequestSchema } from "../../leave.types";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { getRequestEffectiveDaysAction } from "@/features/leave/get-request-effective-days/get-request-effective-days.action";
import {
  resetEffectiveDays,
  setEffectiveDays,
} from "@/features/leave/leave.slice";
import { cn } from "@/lib/utils";
import { FileUploadField } from "@/shared/file-upload-field";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import { toastError } from "@/shared/toast/toast-error";
import { DurationSelect } from "./duration-select";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  data?: Row;
  leave_request_uuid?: string;
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

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
  const {
    leaveRequestsLoading,
    leaveTypes,
    leaveTypesLoading,
    requestEffectiveDays,
    effectiveDaysLoading,
  } = useAppSelector((state) => state.leaveSlice);
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

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
      type: "" as LeaveRequestType,
      range: "" as LeaveRange,
      documents: [],
    },
  });

  const type = watch("type");
  const dateRange = watch("date_range");
  const leaveTypeUuid = watch("leave_type_uuid");
  const range = watch("range");

  useEffect(() => {
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    dispatch(listLeaveTypesAction({ 
      org_uuid,
       params: { 
        user_uuid: currentUser.user_id,
        role_uuid: currentUser.role.uuid!,
        period: period,
      } 
    }));
    dispatch(getOrganizationRolesAction({ org_uuid }));
  }, [org_uuid]);

  useEffect(() => {
    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid,
      }),
    );
  }, [searchTerm, org_uuid]);

  useEffect(() => {
    if (open) {
      reset({
        leave_type_uuid: data?.leave_type?.uuid ?? "",
        type: data?.type ?? ("" as LeaveRequestType),
        range: data?.range ?? ("" as LeaveRange),
        managers: (data?.managers || []).map((m: Managers) => m.user.user_id),
        reason: data?.reason ?? "",
        date_range: {
          start_date: data?.start_date ?? "",
          end_date: data?.end_date ?? "",
        },
        documents: data?.documents ?? [],
      });
    }
    if (!open) dispatch(resetEffectiveDays());
  }, [open, data]);

  useEffect(() => {
    if(!open) return;

    if (type === LeaveRequestType.HALF_DAY) {
      dispatch(setEffectiveDays("0.5"));
      return;
    }

    if (type === LeaveRequestType.SHORT_LEAVE) {
      dispatch(setEffectiveDays("0.25"));
      return;
    }

    const isRequestIncomplete =
      leaveTypeUuid === "" ||
      dateRange.start_date === "" ||
      dateRange.end_date === "" ||
      type === ("" as LeaveRequestType) ||
      range === ("" as LeaveRange);

    if (isRequestIncomplete) {
      dispatch(resetEffectiveDays());
      return;
    }

    dispatch(
      getRequestEffectiveDaysAction({
        org_uuid,
        leave_type_uuid: leaveTypeUuid,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        type: type,
        range: range,
      }),
    );
  }, [open, leaveTypeUuid, dateRange.start_date, dateRange.end_date, type, range]);

  const handleFileUpload = useCallback(
    async (formData: FormData) => {
      const res = await dispatch(fileUploadAction(formData));
      if (fileUploadAction.fulfilled.match(res)) {
        return res.payload.url;
      }
      toastError("File upload failed. Please try again.");
      throw new Error("File upload failed");
    },
    [dispatch],
  );

  const onSubmit = async (data: LeaveRequestFormData) => {
    const dateRange = data.date_range;
    const payload = { ...data, ...dateRange };
    if (leave_request_uuid) {
      await dispatch(
        updateUserLeaveRequestAction({
          org_uuid,
          user_uuid: currentUser.user_id,
          leave_request_uuid,
          ...payload,
        }),
      );
    } else {
      await dispatch(
        createUserLeaveRequestAction({
          org_uuid,
          user_uuid: currentUser.user_id,
          ...payload,
        }),
      );
    }

    await dispatch(
      listUserLeaveRequestsAction({
        org_uuid,
        user_uuid: currentUser.user_id,
      }),
    );

    reset();
    dispatch(resetEffectiveDays());
    onClose();
  };

  const managerOptions = useMemo(() => {
    const base = users.filter((u) => u.user_id !== currentUser.user_id);

    const existingManagers = (data?.managers ?? [])
      .map((m) => m.user)
      .filter((u) => u.user_id !== currentUser.user_id);

    const merged = [...base];
    existingManagers.forEach((u) => {
      if (!merged.some((m) => m.user_id === u.user_id)) {
        merged.push(u);
      }
    });

    return merged;
  }, [users, data, currentUser]);

  const hasEffectiveDays =
    leaveTypeUuid !== "" &&
    dateRange.start_date !== "" &&
    dateRange.end_date !== "" &&
    type !== ("" as LeaveRequestType) &&
    range !== ("" as LeaveRange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-150 lg:max-w-175 overflow-x-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Fill in the form below to request leave.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full min-w-0 py-2 max-h-96 sm:max-h-140 overflow-y-auto no-scrollbar space-y-4">
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
                    data={leaveTypes}
                    isLoading={leaveTypesLoading}
                    label="Leaves"
                    placeholder="Select a leave"
                    emptyMessage="No leave type found"
                    className="w-full"
                  />
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            <Field className="gap-1">
              <FieldLabel>
                Duration <span className="text-destructive">*</span>
              </FieldLabel>
              <DurationSelect
                type={type}
                range={range}
                invalid={!!errors.type || !!errors.range}
                onChange={(nextType, nextRange) => {
                  setValue("type", nextType, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  setValue("range", nextRange, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
              />
              <FieldError
                errors={[
                  { message: errors.type?.message || errors.range?.message },
                ]}
                className="text-xs"
              />
            </Field>

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
                      type={type}
                      maxDays={60}
                      minDate={TODAY}
                      ref={field.ref}
                      disabled={type === ("" as LeaveRequestType)}
                      setDateRange={field.onChange}
                      initialEndDate={data?.end_date}
                      initialStartDate={data?.start_date}
                      invalid={fieldState.invalid}
                      className={cn(
                        fieldState.invalid &&
                          "border-destructive ring-destructive focus-visible:ring-destructive text-destructive",
                      )}
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

            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                hasEffectiveDays
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/30",
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    Effective Days
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Calculated from your selection
                  </span>
                </div>
              </div>

              {effectiveDaysLoading ? (
                <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <span
                  className={cn(
                    "text-2xl font-semibold tabular-nums tracking-tight",
                    hasEffectiveDays ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {requestEffectiveDays ?? 0}
                </span>
              )}
            </div>

            <Controller
              name="managers"
              control={control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel>
                    Apply To <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InfiniteMultiSelect
                    value={field.value}
                    onValuesChange={field.onChange}
                    data={managerOptions}
                    total={total - 1}
                    isLoading={isUsersLoading}
                    onSearch={setSearchTerm}
                    getValue={(u) => u.user_id}
                    getLabel={(u) => u.name}
                    onLoadMore={async () =>
                      await dispatch(
                        listUserAction({
                          pagination: {
                            page: currentPage + 1,
                            limit: 10,
                            search: searchTerm,
                          },
                          org_uuid,
                          isInfiniteScroll: true,
                        }),
                      )
                    }
                    placeholder="Select managers..."
                    ref={field.ref}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            <Controller
              name="documents"
              control={control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel>Attachments</FieldLabel>
                  <FieldDescription>
                    Upload any relevant documents. (optional)
                  </FieldDescription>
                  <FileUploadField
                    ref={field.ref}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    uploadAction={handleFileUpload}
                    invalid={fieldState.invalid}
                    maxFiles={2}
                    maxSize={5 * 1024 * 1024}
                  />
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            <Controller
              name="reason"
              control={control}
              render={({ field, fieldState }) => (
                <Field className="gap-1 truncate">
                  <FieldLabel>Reason</FieldLabel>
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
                  <FieldDescription className="text-xs whitespace-break-spaces">
                    Briefly describe why you are requesting this leave.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button disabled={leaveRequestsLoading} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={leaveRequestsLoading || effectiveDaysLoading || !requestEffectiveDays}

            >
              {leaveRequestsLoading ? (
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
