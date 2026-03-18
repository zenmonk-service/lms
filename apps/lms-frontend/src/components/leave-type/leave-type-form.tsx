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
  CircleMinus,
  Clock,
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
} from "@/features/leave-types/leave-types.action";

import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../ui/multi-select";
import InfiniteScroll from "react-infinite-scroll-component";
import { listUserAction } from "@/features/user/user.action";
import { UserInterface } from "@/features/user/user.slice";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";

const leaveTypeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Leave Type name is required")
      .max(100, "Leave Type name must be 256 characters or fewer"),
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50, "Code must be 256 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(255, "Description must be 256 characters or fewer")
      .optional(),
    applicableRoles: z
      .array(z.string().trim())
      .min(1, "At least one role must be selected"),
    is_sandwich_enabled: z.boolean().optional(),
    is_clubbing_enabled: z.boolean().optional(),
    accrualFrequency: z.enum(["no_accrual", "monthly", "yearly"]),
    allow_negative_leaves: z.boolean(),
    showConsecutiveDays: z.boolean(),
    max_consecutive_days: z.string().trim().optional(),
    leaveCount: z
      .string()
      .trim()
      .nonempty("Leave count is required")
      .max(255, "Leave count must be 256 characters or fewer"),
  })
  .superRefine((data, ctx) => {
    if (!data.showConsecutiveDays) return;

    if (!data.max_consecutive_days) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_consecutive_days"],
        message: "Max consecutive days is required",
      });
      return;
    }

    if (!/^[1-9]\d*$/.test(data.max_consecutive_days)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_consecutive_days"],
        message: "Only positive numbers are allowed",
      });
    }
  });

type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;

interface LeaveTypeFormProps {
  label: "edit" | "create";
  leave_type_uuid?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function LeaveTypeForm({
  label,
  leave_type_uuid,
  isOpen,
  onOpenChange,
  onClose,
}: LeaveTypeFormProps) {
  const { roles } = useAppSelector((state) => state.rolesSlice);
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
      allow_negative_leaves: false,
      showConsecutiveDays: false,
      max_consecutive_days: "",
      accrualFrequency: "no_accrual",
      leaveCount: "",
    },
  });

  const accrualFrequency = watch("accrualFrequency");
  const leaveCount = watch("leaveCount");
  const isSandwich = watch("is_sandwich_enabled");
  const isClubbing = watch("is_clubbing_enabled");

  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );
  const {
    users,
    isLoading: isUsersLoading,
    total,
    currentPage,
    currentUser,
  } = useAppSelector((state) => state.userSlice);
  const [searchTerm, setSearchTerm] = useState("");
  const [applicableFor, setApplicableFor] = useState<"role" | "employee">(
    "role",
  );
  const showConsecutiveDays = watch("showConsecutiveDays");

  useEffect(() => {
    if (applicableFor == "role") {
      dispatch(getOrganizationRolesAction({ org_uuid: currentOrgUUID }));
    } else {
      dispatch(
        listUserAction({
          pagination: {
            page: currentPage + 1,
            limit: 10,
            search: searchTerm,
          },
          org_uuid: currentOrgUUID,
          isInfiniteScroll: true,
        }),
      );
    }
  }, [currentOrgUUID, applicableFor]);

  function cleanObject<T extends Record<string, any>>(
    obj: T,
    keysToClean: string[] = [],
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
      id.trim(),
    );

    const applicable_for = {
      type: applicableFor,
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
            ["period", "applicable_on", "leave_count"],
          )
        : null;

    const payload = {
      name: data.name?.trim(),
      code: data.code?.trim()?.toUpperCase(),
      description: data.description?.trim() || null,
      applicable_for,
      is_sandwich_enabled: data.is_sandwich_enabled || false,
      is_clubbing_enabled: data.is_clubbing_enabled || false,
      allow_negative_leaves: data.allow_negative_leaves || false,
      max_consecutive_days: data.showConsecutiveDays
        ? Number(data.max_consecutive_days)
        : null,
      accrual,
    };

    return payload;
  }

  const onSubmit = async (values: LeaveTypeFormData) => {
    const transformed = transformFormData(values);
    const payload = { ...transformed, org_uuid: currentOrgUUID };

    try {
      await dispatch(createLeaveTypeAction(payload));

      await dispatch(getLeaveTypesAction({ org_uuid: currentOrgUUID }));

      reset();
      setValue("applicableRoles", []);
      onClose();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          reset();
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
                maxLength={100}
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
                maxLength={50}
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
                maxLength={255}
              />
              <FieldDescription>
                Optional: provide a short description for this leave type.
              </FieldDescription>
            </Field>

            <div className="grid grid-cols-1 gap-2 w-full">
              <Field className="gap-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>Apply Policy To</FieldLabel>
                  <Tabs
                    value={applicableFor}
                    onValueChange={(value) => {
                      const next = value as "role" | "employee";
                      setApplicableFor(next);
                      setValue("applicableRoles", []);
                    }}
                    className="scale-90 origin-right"
                  >
                    <TabsList className="h-auto p-1">
                      <TabsTrigger
                        value="role"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Roles
                      </TabsTrigger>
                      <TabsTrigger
                        value="employee"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Employees
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Controller
                  name="applicableRoles"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <MultiSelect
                        values={field.value}
                        onValuesChange={field.onChange}
                      >
                        <MultiSelectTrigger
                          ref={field.ref}
                          className={`w-full hover:bg-transparent ${
                            fieldState.invalid
                              ? "border-destructive ring-destructive"
                              : ""
                          }`}
                        >
                          <MultiSelectValue
                            overflowBehavior="cutoff"
                            placeholder={`Select ${applicableFor === "role" ? "Roles" : "Employees"}...`}
                          />
                        </MultiSelectTrigger>
                        <MultiSelectContent
                          search={{
                            emptyMessage: `No ${applicableFor}s found.`,
                            placeholder: `Search ${applicableFor}s...`,
                          }}
                          onSearch={setSearchTerm}
                          isLoading={isUsersLoading}
                        >
                          {/* Minimalist Select All Toggle */}
                          <div className="px-2 py-1.5 border-b mb-1 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Options
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.preventDefault();
                                const allIds =
                                  applicableFor === "role"
                                    ? roles.map((r: any) => r.uuid)
                                    : users.map(
                                        (u: UserInterface) => u.user_id,
                                      );

                                const isAllSelected = allIds.every((id) =>
                                  field.value?.includes(id),
                                );
                                field.onChange(isAllSelected ? [] : allIds);
                              }}
                            >
                              {(applicableFor === "role" ? roles : users).every(
                                (item: any) =>
                                  field.value?.includes(
                                    applicableFor === "role"
                                      ? item.uuid
                                      : item.user_id,
                                  ),
                              ) && field.value.length > 0
                                ? "Deselect All"
                                : "Select All"}
                            </Button>
                          </div>

                          <MultiSelectGroup>
                            <InfiniteScroll
                              dataLength={
                                applicableFor === "employee"
                                  ? users.length
                                  : roles.length
                              }
                              next={() => {
                                if (applicableFor === "employee") {
                                  dispatch(
                                    listUserAction({
                                      pagination: {
                                        page: currentPage + 1,
                                        limit: 10,
                                        search: searchTerm,
                                      },
                                      org_uuid: currentOrgUUID,
                                      isInfiniteScroll: true,
                                    }),
                                  );
                                }
                              }}
                              hasMore={
                                applicableFor === "employee"
                                  ? users.length < total
                                  : false
                              }
                              loader={
                                <LoaderCircle className="animate-spin mx-auto my-2 w-4 h-4" />
                              }
                              className="max-h-37.5"
                            >
                              {applicableFor === "employee"
                                ? users.map((user: UserInterface) => (
                                    <MultiSelectItem
                                      value={user.user_id}
                                      key={user.user_id}
                                    >
                                      {user.name}
                                    </MultiSelectItem>
                                  ))
                                : roles.map((role: any) => (
                                    <MultiSelectItem
                                      value={role.uuid}
                                      key={role.uuid}
                                    >
                                      {role.name}
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
                    </>
                  )}
                />
              </Field>
            </div>

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

            <Controller
              name="allow_negative_leaves"
              control={control}
              render={({ field }) => (
                <FieldLabel htmlFor="switch-allow-negative-leaves">
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

            <FieldLabel htmlFor="switch-consecutive-leaves">
              <Field orientation="horizontal">
                <FieldContent>
                  <div className="flex gap-2">
                    <div className="bg-muted p-2 rounded-lg h-fit">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <FieldTitle className="font-semibold">
                        Limit Max Consecutive Days
                      </FieldTitle>
                      <FieldDescription className="text-muted-foreground text-xs ">
                        Restricts the number of days taken in a single request.
                      </FieldDescription>
                      <Collapsible open={showConsecutiveDays}>
                        <CollapsibleContent>
                          <Controller
                            name="max_consecutive_days"
                            control={control}
                            render={({ field }) => (
                              <div className="mt-4 flex items-center gap-2">
                                <Input
                                  value={field.value}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === "") {
                                      field.onChange("");
                                      return;
                                    }

                                    if (/^[1-9]\d*$/.test(value)) {
                                      field.onChange(value);
                                    }
                                  }}
                                  className="bg-background px-3 py-1.5 text-xs w-24 outline-none focus:ring-1 focus:ring-primary"
                                  id="max_consecutive_days"
                                  placeholder="e.g. 10"
                                  aria-invalid={!!errors.max_consecutive_days}
                                />
                                <p className="text-muted-foreground text-xs">
                                  days maximum per request
                                </p>
                              </div>
                            )}
                          />
                          <FieldError
                            errors={[errors.max_consecutive_days]}
                            className="text-xs"
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </FieldContent>
                <Controller
                  name="showConsecutiveDays"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="switch-consecutive-leaves"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          setValue("max_consecutive_days", "");
                        }
                      }}
                    />
                  )}
                />
              </Field>
            </FieldLabel>

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
                        <SelectTrigger className="w-full">
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
