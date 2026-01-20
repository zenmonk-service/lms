"use client";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCog,
  CircleAlert,
  LoaderCircle,
  Sandwich,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import {
  createLeaveTypeAction,
  getLeaveTypesAction,
  updateLeaveTypeAction,
} from "@/features/leave-types/leave-types.action";

import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const leaveTypeSchema = z.object({
  name: z.string().trim().min(2, "Leave Type name is required"),
  code: z.string().trim().min(1, "Code is required"),
  description: z.string().trim().optional(),
  applicableRoles: z
    .array(z.string().trim())
    .min(1, "At least one role must be selected"),
  is_sandwich_enabled: z.boolean().optional(),
  is_clubbing_enabled: z.boolean().optional(),
  accrualFrequency: z.enum(["no_accrual", "monthly", "yearly"]),
  leaveCount: z.string().trim().nonempty("Leave count is required"),
});

type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;

interface LeaveTypeFormProps {
  label: "edit" | "create";
  data?: LeaveTypeFormData;
  leave_type_uuid?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function LeaveTypeForm({
  label,
  data,
  leave_type_uuid,
  isOpen,
  onOpenChange,
  onClose,
}: LeaveTypeFormProps) {
  const selector = useAppSelector((state) => state.rolesSlice);
  const { isLoading } = useAppSelector((state) => state.leaveTypeSlice);
  const dispatch = useAppDispatch();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      applicableRoles: [],
      is_sandwich_enabled: false,
      is_clubbing_enabled: false,
      accrualFrequency: "no_accrual",
      leaveCount: "",
    },
  });

  const accrualFrequency = watch("accrualFrequency");
  const leaveCount = watch("leaveCount");
  const isSandwich = watch("is_sandwich_enabled");
  const isClubbing = watch("is_clubbing_enabled");

  const organizationRoles = selector.roles || [];
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid
  );

  useEffect(() => {
    if (!isOpen || !data) return;
    reset({
      name: data.name || "",
      code: data.code || "",
      description: data.description || "",
      applicableRoles: data.applicableRoles || [],
      is_sandwich_enabled: data.is_sandwich_enabled || false,
      is_clubbing_enabled: data.is_clubbing_enabled || false,
      accrualFrequency: data.accrualFrequency || "no_accrual",
      leaveCount: String(data.leaveCount) || "",
    });

    setSelectedRoles(data.applicableRoles);
  }, [isOpen]);

  useEffect(() => {
    dispatch(getOrganizationRolesAction({ org_uuid: currentOrgUUID }));
  }, [currentOrgUUID]);

  function cleanObject<T extends Record<string, any>>(
    obj: T,
    keysToClean: string[] = []
  ) {
    const out = { ...obj };
    keysToClean.forEach((k) => {
      if (out[k] === null || out[k] === undefined || out[k] === "") {
        delete out[k];
      }
    });
    return out;
  }

  function transformFormData(data: any) {
    const selected = (data.applicableRoles || []).map((id: string) =>
      id.trim()
    );

    const applicable_for = {
      type: "role",
      value: selected,
    };

    const frequencyToPeriodMap: Record<string, string> = {
      no_accrual: "no_accrual",
      monthly: "monthly",
      yearly: "yearly",
      quarterly: "quarterly",
      half_yearly: "half_yearly",
    };

    const period =
      (data.accrualFrequency && frequencyToPeriodMap[data.accrualFrequency]) ||
      data.accrualFrequency;

    const accrual =
      period || (data.leaveCount !== "" && data.leaveCount !== undefined)
        ? cleanObject(
            {
              period,
              applicable_on: "start_of_month",
              leave_count: Number(data.leaveCount),
            },
            ["period", "applicable_on", "leave_count"]
          )
        : null;

    const payload = {
      name: data.name?.trim(),
      code: data.code?.trim()?.toUpperCase(),
      description: data.description?.trim() || null,
      applicable_for,
      is_sandwich_enabled: data.is_sandwich_enabled || false,
      is_clubbing_enabled: data.is_clubbing_enabled || false,
      accrual,
    };

    return payload;
  }

  const onSubmit = async (values: LeaveTypeFormData) => {
    const transformed = transformFormData(values);
    const payload =
      label === "create"
        ? { ...transformed, org_uuid: currentOrgUUID }
        : { ...transformed, org_uuid: currentOrgUUID, leave_type_uuid };

    try {
      if (label === "create") {
        await dispatch(createLeaveTypeAction(payload));
      } else {
        await dispatch(updateLeaveTypeAction(payload));
      }

      await dispatch(getLeaveTypesAction({ org_uuid: currentOrgUUID }));

      reset();
      setSelectedRoles([]);
      setValue("applicableRoles", []);
      onClose();
    } catch (error) {
      throw error;
    }
  };

  const toggleSelectAll = () => {
    const allUuids = (organizationRoles || []).map((r: any) => r.uuid);
    const currentlyAllSelected =
      selectedRoles.length === allUuids.length && allUuids.length > 0;

    if (currentlyAllSelected) {
      setSelectedRoles([]);
      setValue("applicableRoles", []);
    } else {
      setSelectedRoles(allUuids);
      setValue("applicableRoles", allUuids);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          reset();
          setSelectedRoles([]);
          setValue("applicableRoles", []);
        }
      }}
    >
      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {label === "create" ? "Create Leave Type" : "Edit Leave Type"}
            </DialogTitle>
            <DialogDescription>
              {label === "create"
                ? "Configure a new leave type with custom rules and settings."
                : "Edit the leave type with custom rules and settings."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 overflow-y-auto max-h-96 no-scrollbar py-2">
            {/* Name */}
            <Field className="gap-1">
              <FieldLabel htmlFor="name">Leave Type Name *</FieldLabel>
              <Input
                {...register("name")}
                id="name"
                placeholder="Annual Leave"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <FieldError errors={[errors.name]} className="text-xs" />
              )}
            </Field>

            {/* Code */}
            <Field className="gap-1">
              <FieldLabel htmlFor="code">Unique Code *</FieldLabel>
              <Input
                {...register("code")}
                id="code"
                placeholder="AL"
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <FieldError errors={[errors.code]} className="text-xs" />
              )}
            </Field>

            {/* Description */}
            <Field className="gap-1">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                {...register("description")}
                id="description"
                placeholder="Describe leave type..."
              />
              <FieldDescription>
                Optional: provide a short description for this leave type.
              </FieldDescription>
            </Field>

            {/* Roles */}
            <Field className="gap-1">
              <div className="flex items-center justify-between">
                <FieldLabel>Select Applicable Roles</FieldLabel>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={toggleSelectAll}
                >
                  {selectedRoles.length ===
                  (organizationRoles || []).map((r: any) => r.uuid).length
                    ? "Clear"
                    : "Select All"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {organizationRoles?.map((role: any) => (
                  <div key={role.uuid} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.uuid}
                      checked={selectedRoles.includes(role.uuid)}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...selectedRoles, role.uuid]
                          : selectedRoles.filter((r) => r !== role.uuid);

                        setSelectedRoles(updated);
                        setValue("applicableRoles", updated);
                      }}
                    />
                    <label htmlFor={role.uuid} className="select-none">
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>

              {errors.applicableRoles && (
                <FieldError
                  errors={[errors.applicableRoles]}
                  className="text-xs"
                />
              )}
            </Field>

            <Separator />

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-lg">
                  <CalendarCog className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm">Configure Leave Policy</p>
                  <p className="text-xs">
                    Enable different leave calculation modes. Multiple modes can
                    be active simultaneously.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="is_sandwich_enabled"
                  control={control}
                  render={({ field }) => (
                    <Label className="hover:bg-accent/50 flex items-start justify-between gap-3 rounded-lg border p-3 has-aria-checked:border-primary has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary dark:has-aria-checked:bg-primary/10">
                      <div className="bg-muted p-2 rounded-lg">
                        <Sandwich className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold">Enable Sandwich</p>
                        <p className="text-muted-foreground text-xs">
                          Employees are not permitted to take leave immediately
                          before or after public holidays; any intervening
                          holidays will be counted as leave days.
                        </p>
                      </div>
                      <Checkbox
                        id="toggle-sandwich"
                        className="ml-auto"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Label>
                  )}
                />

                <Controller
                  name="is_clubbing_enabled"
                  control={control}
                  render={({ field }) => (
                    <Label className="hover:bg-accent/50 flex items-start justify-between gap-3 rounded-lg border p-3 has-aria-checked:border-primary has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary dark:has-aria-checked:bg-primary/10">
                      <div className="bg-muted p-2 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold">Enable Clubbing</p>
                        <p className="text-muted-foreground text-xs">
                          Different leave types cannot be combined into a single
                          continuous leave period; consecutive leaves will be
                          treated as one block and deducted accordingly.
                        </p>
                      </div>
                      <Checkbox
                        id="toggle-clubbing"
                        className="ml-auto"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Label>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                <CircleAlert className="w-4 h-4" />
                <p className="text-xs">
                  <span className="font-semibold">
                    Current Mode Configuration:
                  </span>{" "}
                  {isSandwich && isClubbing
                    ? "Hybrid mode (Sandwich + Clubbing) active."
                    : isSandwich
                      ? "Sandwich logic active."
                      : isClubbing
                        ? "Clubbing logic active."
                        : "Standard execution only."}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field className="gap-1">
                <Controller
                  control={control}
                  name="accrualFrequency"
                  render={({ field }) => (
                    <>
                      <FieldLabel>Accrual</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Accrual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no_accrual">No Accrual</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                />
              </Field>

              <Field className="gap-1">
                <FieldLabel htmlFor="leaveCount">Leave count</FieldLabel>
                <Input
                  {...register("leaveCount")}
                  id="leaveCount"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Leave count (e.g. 2.5)"
                  aria-invalid={!!errors.leaveCount}
                />
                {errors.leaveCount && (
                  <FieldError
                    errors={[errors.leaveCount]}
                    className="text-xs"
                  />
                )}
              </Field>

              <div>
                {/* Preview */}
                {leaveCount ? (
                  <div
                    className="
                 h-full 
                p-2 text-sm 
                rounded-md 
                bg-accent 
                text-accent-foreground 
                border border-border 
            "
                  >
                    <p className="font-semibold">Preview:</p>
                    <p className="text-sm">
                      {leaveCount && `${leaveCount} days`}{" "}
                      {accrualFrequency &&
                        accrualFrequency !== "no_accrual" &&
                        `accrued ${accrualFrequency}`}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : label === "edit" ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
