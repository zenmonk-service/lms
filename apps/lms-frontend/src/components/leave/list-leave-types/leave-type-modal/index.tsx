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
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { createLeaveTypeAction } from "@/features/leave/create-leave-type/create-leave-type.action";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarCheck,
  CircleMinus,
  FastForward,
  LoaderCircle,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import BasicInfo from "./components/basic-info";
import RoleEmployeeMultiSelect from "./components/role-employee-multi-select";
import MinTenure from "./components/min-tenure";
import ConsecutiveDays from "./components/consecutive-days";
import ClubbingAndSandwich from "./components/club-sandwich";
import LeaveAccrual from "./components/leave-accrual";
import Transferable from "./components/transferable";
import SwitchField from "./components/switch-field";
import { useCallback, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
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

  const [isEditMode, setIsEditMode] = useState(!!leaveType);

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
      is_full_day_only: leaveType?.is_full_day_only ?? false,
      allow_negative_leaves: leaveType?.allow_negative_leaves ?? false,
      showConsecutiveDays: !!leaveType?.max_consecutive_days,
      max_consecutive_days: leaveType?.max_consecutive_days?.toString() ?? "",
      min_tenure_months: leaveType?.min_tenure_months?.toString() ?? "0",
      period: leaveType?.accrual?.period ?? TimePeriod.NONE,
      leave_count: leaveType?.accrual?.leave_count?.toString() ?? "",
      carry_forward: leaveType?.carry_forward ?? true,
      applicable_on:
        leaveType?.accrual.applicable_on ?? LeaveApplicableOn.START_OF_MONTH,
      transfer_to: {
        is_applicable: !!leaveType?.transfer_leave_type_uuid,
        transfer_leave_type_uuid: leaveType?.transfer_leave_type_uuid ?? null,
      },
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

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    setIsEditMode(!!leaveType);
    reset(getDefaultValues(leaveType));
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
      is_full_day_only,
      allow_negative_leaves,
      carry_forward,
      applicable_for,
      applicable_on,
      transfer_to,
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
      is_full_day_only,
      allow_negative_leaves,
      carry_forward,
      accrual,
      transfer_leave_type_uuid: transfer_to.is_applicable
        ? transfer_to.transfer_leave_type_uuid
        : null,
      min_tenure_months: data.min_tenure_months
        ? Number(data.min_tenure_months)
        : 0,
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
              <BasicInfo />
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

              <MinTenure />
              <Separator />

              <ClubbingAndSandwich />
              <Separator />

              <Transferable currentLeaveTypeUuid={leaveType?.uuid} />
              <ConsecutiveDays />
              
              <Separator />

              <SwitchField
                name="carry_forward"
                icon={FastForward}
                title="Carry Forward"
                description="Allow employees to carry forward unused leaves to the next year."
              />

              <SwitchField
                name="is_full_day_only"
                icon={CalendarCheck}
                title="Full Day Only"
                description="This leave type can only be taken as a full day — half-day and short leave are not allowed."
              />

              <SwitchField
                name="allow_negative_leaves"
                icon={CircleMinus}
                title="Negative Balance Allowed"
                description="Allow employees to take leave even if balance is zero."
              />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button disabled={leaveTypesLoading} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={leaveTypesLoading || !form.formState.isDirty}>
                {leaveTypesLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create"
                )}
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