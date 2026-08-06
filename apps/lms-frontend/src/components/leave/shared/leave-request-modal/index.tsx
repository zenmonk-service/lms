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
import { LoaderCircle, RefreshCw } from "lucide-react";
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
import { resetEffectiveDays } from "@/features/leave/leave.slice";
import { cn } from "@/lib/utils";
import { FileUploadField } from "@/shared/file-upload-field";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import { toastError } from "@/shared/toast/toast-error";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  data?: Row;
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
      documents: [],
    },
  });

  const type = watch("type");
  const dateRange = watch("date_range");
  const leaveTypeUuid = watch("leave_type_uuid");
  const range = watch("range");

  useEffect(() => {
    dispatch(listLeaveTypesAction({ org_uuid: currentOrganizationUuid }));
    dispatch(getOrganizationRolesAction({ org_uuid: currentOrganizationUuid }));
  }, [currentOrganizationUuid]);

  useEffect(() => {
    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid: currentOrganizationUuid,
      }),
    );
  }, [searchTerm, currentOrganizationUuid]);

  useEffect(() => {
    if (open) {
      reset({
        leave_type_uuid: data?.leave_type?.uuid ?? "",
        type: data?.type ?? "",
        range: data?.range ?? "",
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
  }, [open]);

  useEffect(() => {
    if (
      leaveTypeUuid === "" ||
      dateRange.start_date === "" ||
      dateRange.end_date === "" ||
      type === "" ||
      range === ""
    )
      return;

    dispatch(
      getRequestEffectiveDaysAction({
        org_uuid: currentOrganizationUuid,
        leave_type_uuid: leaveTypeUuid,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        type: type,
        range: range,
      }),
    );
  }, [leaveTypeUuid, dateRange.start_date, dateRange.end_date, type, range]);

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
          org_uuid: currentOrganizationUuid,
          user_uuid: currentUser.user_id,
          leave_request_uuid,
          ...payload,
        }),
      );
    } else {
      await dispatch(
        createUserLeaveRequestAction({
          org_uuid: currentOrganizationUuid,
          user_uuid: currentUser.user_id,
          ...payload,
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
    dispatch(resetEffectiveDays());
    onClose();
  };

  const leavesForCurrentUser = useMemo(() => {
    const activeLeaves = leaveTypes?.rows?.filter((lt) => lt.is_active);

    return activeLeaves?.filter((leave) => {
      const matchesByRole = leave.roles.some(
        (role) => role.uuid === currentUser.role.uuid,
      );
      const matchesByUser = leave.users.some(
        (user) => user.user_id === currentUser.user_id,
      );

      return matchesByRole || matchesByUser;
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

          <div className="py-2 max-h-96 sm:max-h-140 overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-4 pr-2">
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
                      isLoading={leaveTypesLoading}
                      label="Leaves"
                      placeholder="Select a leave"
                      emptyMessage="No leave type found"
                      className="w-full"
                    />
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                          if (val === LeaveRequestType.FULL_DAY)
                            setValue("range", LeaveRange.FULL_DAY);
                          else setValue("range", "");
                        }}
                        getValue={(item) => item}
                        getLabel={(item) =>
                          item.replace("_", " ").slice(0, 1).toUpperCase() +
                          item.replace("_", " ").slice(1).toLowerCase()
                        }
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
                        className="w-full"
                        label="Leave Range"
                        value={field.value}
                        disabled={type === ""}
                        getValue={(item) => item}
                        onValueChange={field.onChange}
                        placeholder="Select leave range"
                        aria-invalid={fieldState.invalid}
                        data={allowedRanges[type as LeaveRequestType] || []}
                        getLabel={(item) =>
                          item.replace("_", " ").slice(0, 1).toUpperCase() +
                          item.replace("_", " ").slice(1).toLowerCase()
                        }
                      />

                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    </Field>
                  )}
                />
              </div>

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
                        disabled={type === ""}
                        setDateRange={field.onChange}
                        initialEndDate={data?.end_date}
                        initialStartDate={data?.start_date}
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

              <div className="flex items-center justify-end gap-2">
                {effectiveDaysLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="animate-spin size-4" />
                    <p className="text-sm">Evaluating Effective Days</p>
                  </div>
                ) : (
                  <p className="text-sm">
                    Effective Days:{" "}
                    <span className="text-primary font-semibold tracking-wider">
                      {requestEffectiveDays ?? 0}
                    </span>
                  </p>
                )}
              </div>

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
                      data={users.filter(
                        (manager) => manager.user_id !== currentUser.user_id,
                      )}
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
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />

              <Controller
                name="documents"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>Attachments</FieldLabel>
                    <FieldDescription>Upload any relevant documents. (optional)</FieldDescription>
                    <FileUploadField
                      ref={field.ref}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      uploadAction={handleFileUpload}
                      invalid={fieldState.invalid}
                      maxFiles={2}
                      maxSize={5 * 1024 * 1024}
                    />
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
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
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={leaveRequestsLoading || effectiveDaysLoading}
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
