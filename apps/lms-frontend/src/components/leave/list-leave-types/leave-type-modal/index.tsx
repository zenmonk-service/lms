import {
  LeaveTypeFormData,
  leaveTypeSchema,
} from "@/components/leave/leave.types";
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
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { createLeaveTypeAction } from "@/features/leave/create-leave-type/create-leave-type.action";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleMinus, FastForward } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import RoleEmployeeMultiSelect from "./components/role-employee-multi-select";
import ConsecutiveDays from "./components/consecutive-days";
import ClubbingAndSandwich from "./components/club-sandwich";
import LeaveAccrual from "./components/leave-accrual";
import { useCallback, useEffect, useState } from "react";
import {
  LeaveApplicableOn,
  LeaveType,
  TimePeriod,
} from "@/features/leave/leave.types";
import { updateLeaveTypeAction } from "@/features/leave/update-leave-type/update-leave-type.action";

interface IProps {
  open: boolean;
  onOpenChange: () => void;
  leaveType?: LeaveType | null;
}

const LeaveTypeModal = ({ open, onOpenChange, leaveType }: IProps) => {
  const { leaveTypesLoading } = useAppSelector((state) => state.leaveSlice);
  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const dispatch = useAppDispatch();
  const isEditMode = !!leaveType;

  const getDefaultValues = useCallback(
    (leaveType?: LeaveType | null) => ({
      name: leaveType?.name ?? "",
      code: leaveType?.code ?? "",
      description: leaveType?.description ?? "",
      applicable_for: {
        roles: leaveType?.roles.map((role) => role.uuid) ?? [],
        users: leaveType?.users.map((user) => user.user_id) ?? [],
      },
      is_sandwich_enabled: leaveType?.is_sandwich_enabled ?? false,
      is_clubbing_enabled: leaveType?.is_clubbing_enabled ?? false,
      allow_negative_leaves: leaveType?.allow_negative_leaves ?? false,
      showConsecutiveDays: !!leaveType?.max_consecutive_days,
      max_consecutive_days: leaveType?.max_consecutive_days?.toString() ?? "",
      period: leaveType?.accrual?.period ?? TimePeriod.NONE,
      leave_count: leaveType?.accrual?.leave_count?.toString() ?? "",
      carry_forward: leaveType?.carry_forward ?? true,
      applicable_on:
        leaveType?.accrual.applicable_on ?? LeaveApplicableOn.START_OF_MONTH,
    }),
    [leaveType],
  );

  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    mode: "onSubmit",
    defaultValues: getDefaultValues(leaveType),
  });

  const { control, reset, handleSubmit } = form;

  const [pendingCreateData, setPendingCreateData] = useState<LeaveTypeFormData | null>(null);

  useEffect(() => {
    if (!open) return;

    reset(getDefaultValues(leaveType));

    return () => {
      reset(getDefaultValues(null));
    };
  }, [open, leaveType, reset]);

  const transformDataForSubmission = (data: LeaveTypeFormData) => {
    const leave_count = Number(data.leave_count);
    const period = data.period;
    const showConsecutiveDays = data.showConsecutiveDays;

    const {
      name,
      code,
      description,
      is_sandwich_enabled,
      is_clubbing_enabled,
      allow_negative_leaves,
      carry_forward,
      applicable_for,
      applicable_on
    } = data;

    const accrual = {
      period,
      applicable_on,
      leave_count,
    };

    return {
      name,
      code,
      description,
      is_sandwich_enabled,
      is_clubbing_enabled,
      allow_negative_leaves,
      carry_forward,
      accrual,
      max_consecutive_days: showConsecutiveDays
        ? Number(data.max_consecutive_days)
        : undefined,
      ...applicable_for,
    };
  };

  const handleClose = () => {
    onOpenChange();
  };

  const handleSaveLeaveType = async (data: ReturnType<typeof transformDataForSubmission>) => {
    try {
      if (isEditMode && leaveType) {
        const { accrual, ...rest } = data;
        await dispatch(
          updateLeaveTypeAction({
            ...rest,
            uuid: leaveType.uuid,
            org_uuid: currentOrgUUID,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createLeaveTypeAction({ ...data, org_uuid: currentOrgUUID }),
        ).unwrap();
      }
      await dispatch(listLeaveTypesAction({ org_uuid: currentOrgUUID }));
    } catch (error) {
    } finally {
      handleClose();
    }
  };

  const onSubmit = async (data: LeaveTypeFormData) => {
    if (!isEditMode) {
      setPendingCreateData(data);
      return;
    }
    await handleSaveLeaveType(transformDataForSubmission(data));
  };

  const handleConfirmCreate = async () => {
    if (!pendingCreateData) return;
    await handleSaveLeaveType(transformDataForSubmission(pendingCreateData));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-150 lg:max-w-175">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Leave Type" : "Create Leave Type"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the rules and settings for this leave type."
              : "Configure a new leave type with custom rules and settings."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2 overflow-y-auto max-h-[70vh] no-scrollbar py-2">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>
                      Leave Type Name{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="Annual Leave"
                      maxLength={100}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />

              <Controller
                name="code"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>
                      Unique Code <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="AL"
                      maxLength={50}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      placeholder="Describe leave type..."
                      maxLength={255}
                      className="wrap-anywhere text-sm"
                    />
                    <FieldDescription className="text-xs whitespace-normal wrap-break-word">
                      Optional: provide a short description for this leave type.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Separator />

              {!isEditMode && (
                <>
                  <LeaveAccrual />
                  <Separator />
                </>
              )}

              <RoleEmployeeMultiSelect
                control={control}
                name={"applicable_for"}
                initialSelectedRoles={leaveType?.roles}
                initialSelectedUsers={leaveType?.users}
                resetKey={leaveType?.uuid ?? "new"}
              />
              <Separator />

              <ClubbingAndSandwich />
              <Separator />

              <Controller
                name="carry_forward"
                control={control}
                render={({ field }) => (
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <FieldContent className="min-w-0">
                        <div className="flex gap-2">
                          <div className="bg-muted p-2 rounded-lg h-fit shrink-0">
                            <FastForward className="w-4 h-4" />
                          </div>
                          <div>
                            <FieldTitle className="font-semibold whitespace-normal wrap-break-word">
                              Carry Forward
                            </FieldTitle>
                            <FieldDescription className="text-xs whitespace-normal wrap-break-word">
                              Allow employees to carry forward unused leaves to
                              the next year.
                            </FieldDescription>
                          </div>
                        </div>
                      </FieldContent>
                      <Switch
                        id="switch-carry-forward"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  </FieldLabel>
                )}
              />

              <ConsecutiveDays />

              <Controller
                name="allow_negative_leaves"
                control={control}
                render={({ field }) => (
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <FieldContent className="min-w-0">
                        <div className="flex gap-2">
                          <div className="bg-muted p-2 rounded-lg h-fit shrink-0">
                            <CircleMinus className="w-4 h-4" />
                          </div>
                          <div>
                            <FieldTitle className="font-semibold whitespace-normal wrap-break-word">
                              Negative Balance Allowed
                            </FieldTitle>
                            <FieldDescription className="text-xs whitespace-normal wrap-break-word">
                              Allow employees to take leave even if balance is
                              zero.
                            </FieldDescription>
                          </div>
                        </div>
                      </FieldContent>
                      <Switch
                        id="switch-allow-negative-leaves"
                        className="shrink-0"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  </FieldLabel>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button disabled={leaveTypesLoading} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={leaveTypesLoading || !form.formState.isDirty}>
                {isEditMode ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>

        <ConfirmationDialog
          open={!!pendingCreateData}
          onOpenChange={(next) => {
            if (!next) setPendingCreateData(null);
          }}
          isLoading={leaveTypesLoading}
          title="Accrual settings can't be changed later"
          description="Once this leave type is created, its accrual — period, leave count, and when it applies — is locked. Everything else stays editable. Continue?"
          handleConfirm={handleConfirmCreate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeaveTypeModal;