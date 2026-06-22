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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createLeaveTypeAction } from "@/features/leave/create-leave-type/create-leave-type.action";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleMinus, FastForward } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import RoleEmployeeMultiSelect from "./components/role-employee-multi-select";
import ConsecutiveDays from "./components/consecutive-days";
import ClubbingAndSandwich from "./components/club-sandwich";
import { useState } from "react";
import Confirm from "./components/confirmation-dialog";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeaveTypeModal = ({ open, onOpenChange }: IProps) => {
  const { leaveTypesLoading } = useAppSelector((state) => state.leaveSlice);
  const currentOrgUUID = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);

  const dispatch = useAppDispatch();

  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      code: "",
      description: "",
      applicable_for: {
        type: "role",
        value: [],
      },
      is_sandwich_enabled: false,
      is_clubbing_enabled: false,
      allow_negative_leaves: false,
      showConsecutiveDays: false,
      max_consecutive_days: "",
      period: "no_accrual",
      leave_count: "",
      carry_forward: true,
    },
  });

  const { control, watch, reset, handleSubmit } = form;
  
  const accrualFrequency = watch("period");
  const leaveCount = watch("leave_count");

  const [formData, setFormData] = useState<LeaveTypeFormData | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [pendingApplicableFor, setPendingApplicableFor] = useState<string[]>([]);
  const [pendingData, setPendingData] = useState<Omit<LeaveTypeFormData, "applicable_for"> & { applicable_for: { name: string[] } } | null>(null);

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
    } = data;

    const accrual = {
      period,
      applicable_on: "start_of_month",
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
      max_consecutive_days: showConsecutiveDays ? Number(data.max_consecutive_days) : undefined,
      applicable_for,
    };
  };

  const transformDataForPreview = (
    data: LeaveTypeFormData,
    pendingApplicableFor: string[],
  ) => {
    const { applicable_for: applicableFor, ...rest } = data;
    return {
      ...rest,
      applicable_for: { name: pendingApplicableFor },
    }
  };

  const handleClose = () => {
    setFormData(null);
    setPendingData(null);
    setPendingApplicableFor([]);
    setConfirmationDialogOpen(false);

    reset();
    onOpenChange(false);
  }

  const handleCreateLeaveType = async (data: ReturnType<typeof transformDataForSubmission>) => {
    await dispatch(createLeaveTypeAction({...data, org_uuid: currentOrgUUID }));
    await dispatch(listLeaveTypesAction({ org_uuid: currentOrgUUID }));
    
    handleClose();
  };

  const handleConfirm = async () => {
    const transformedData = transformDataForSubmission(formData!);
    await handleCreateLeaveType(transformedData);
    
    handleClose();
  }

  const handleConfirmationDialogOpen = (data: LeaveTypeFormData) => {
    const transformedData = transformDataForPreview(data, pendingApplicableFor);
    setConfirmationDialogOpen(true);
    setPendingData(transformedData);
  }

  const onSubmit = async (data: LeaveTypeFormData) => {
    setFormData(data);
    handleConfirmationDialogOpen(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-175">
        <DialogHeader>
          <DialogTitle>Create Leave Type</DialogTitle>
          <DialogDescription>
            Configure a new leave type with custom rules and settings.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 overflow-y-auto max-h-[70vh] no-scrollbar py-2">
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
                    />
                    <FieldDescription className="text-xs">
                      Optional: provide a short description for this leave type.
                    </FieldDescription>
                  </Field>
                )}
              />

              <RoleEmployeeMultiSelect setPendingApplicableFor={setPendingApplicableFor} />
              <Separator />

              <ClubbingAndSandwich />
              <Separator />

              <Controller
                name="carry_forward"
                control={control}
                render={({ field }) => (
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <div className="flex gap-2">
                          <div className="bg-muted p-2 rounded-lg h-fit">
                            <FastForward className="w-4 h-4" />
                          </div>
                          <div>
                            <FieldTitle className="font-semibold">
                              Carry Forward
                            </FieldTitle>
                            <FieldDescription className="text-muted-foreground text-xs ">
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

              <Controller
                name="allow_negative_leaves"
                control={control}
                render={({ field }) => (
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <div className="flex gap-2">
                          <div className="bg-muted p-2 rounded-lg h-fit">
                            <CircleMinus className="w-4 h-4" />
                          </div>
                          <div>
                            <FieldTitle className="font-semibold">
                              Negative Balance Allowed
                            </FieldTitle>
                            <FieldDescription className="text-muted-foreground text-xs ">
                              Allow employees to take leave even if balance is
                              zero.
                            </FieldDescription>
                          </div>
                        </div>
                      </FieldContent>
                      <Switch
                        id="switch-allow-negative-leaves"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  </FieldLabel>
                )}
              />

              <ConsecutiveDays />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="period"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>
                        Accrual <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!!fieldState.error}
                        >
                          <SelectValue placeholder="Accrual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no_accrual">No Accrual</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="leave_count"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>
                        Leave count <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            field.onChange("");
                            return;
                          }

                          if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                        id="leaveCount"
                        placeholder="Leave count (e.g. 2.5)"
                        aria-invalid={!!fieldState.error}
                      />

                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs overflow-hidden whitespace-nowrap text-ellipsis"
                      />
                      {!fieldState.error && (
                        <p className="text-xs text-balance text-primary font-medium tracking-tight">
                          {leaveCount &&
                            (accrualFrequency &&
                            accrualFrequency !== "no_accrual"
                              ? `${leaveCount} days per ${accrualFrequency} (accrued)`
                              : `${leaveCount} days granted upfront`)}
                        </p>
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
              <Button type="submit" disabled={leaveTypesLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
        
        <Confirm 
          data={pendingData!}
          open={confirmationDialogOpen}
          isLoading={leaveTypesLoading}
          handleConfirm={handleConfirm}
          onOpenChange={setConfirmationDialogOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeaveTypeModal;
