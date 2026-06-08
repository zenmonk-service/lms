import { Briefcase, Phone, User } from "lucide-react";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { type EditUserFormData } from "../user.types";
import { Separator } from "../../../ui/separator";

type UserEditPageProfileTabsProps = {
  isLoading?: boolean;
  isEditing: boolean;
  register: UseFormRegister<EditUserFormData>;
  errors: FieldErrors<EditUserFormData>;
  watchedRole: string;
  watchedShift: string;
  maritalStatus: string;
  employmentType: string;
  workMode: string;
  roles: any[];
  shifts: any[];
  onRoleChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  onMaritalStatusChange: (value: string) => void;
  onEmploymentTypeChange: (value: string) => void;
  onWorkModeChange: (value: string) => void;
};

export default function UserEditPageProfileTabs({
  isLoading = false,
  isEditing,
  register,
  errors,
  watchedRole,
  watchedShift,
  maritalStatus,
  employmentType,
  workMode,
  roles,
  shifts,
  onRoleChange,
  onShiftChange,
  onMaritalStatusChange,
  onEmploymentTypeChange,
  onWorkModeChange,
}: Readonly<UserEditPageProfileTabsProps>) {
  if (isLoading) {
    return (
      <>
        <TabsContent value="basic" className="space-y-4">
          <div className="rounded-lg border border-border p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {["name", "email", "role", "shift", "basic1", "basic2"].map(
                (key) => (
                  <div key={key} className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ),
              )}
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[ "marital", "employment", "mode", "branch"].map(
                (key) => (
                  <div key={key} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ),
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="rounded-2xl border border-border/40 p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-60" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "official-phone",
                "emergency-name",
                "emergency-relation",
                "emergency-phone",
                "guardian-name",
                "guardian-relation",
                "guardian-phone",
              ].map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </>
    );
  }

  return (
    <>
      <TabsContent
        value="basic"
        className="rounded-lg border border-border p-6 bg-background space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">Basic details</p>
              <p className="text-xs text-muted-foreground">
                Update your basic information
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                {...register("name")}
                disabled={!isEditing}
                placeholder="Enter full name"
                pattern="[a-zA-Z\s]*"
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                {...register("email")}
                disabled
                placeholder="Enter email"
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={watchedRole}
                disabled={!isEditing}
                onValueChange={onRoleChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role: any) => (
                    <SelectItem key={role.uuid} value={role.uuid}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <FieldError>{errors.role.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Shift</FieldLabel>
              <Select
                value={watchedShift}
                disabled={!isEditing}
                onValueChange={onShiftChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts?.map((shift: any) => (
                    <SelectItem key={shift.uuid} value={shift.uuid}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shift && <FieldError>{errors.shift.message}</FieldError>}
            </Field>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/20">
              <Briefcase className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="font-bold">Employment details</p>
              <p className="text-xs text-muted-foreground">
                Update your employment information
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Marital Status</FieldLabel>
              <Select
                value={maritalStatus}
                disabled={!isEditing}
                onValueChange={onMaritalStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
              {errors.marital_status && (
                <FieldError>{errors.marital_status.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Employment Type</FieldLabel>
              <Select
                value={employmentType}
                disabled={!isEditing}
                onValueChange={onEmploymentTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              {errors.employment_type && (
                <FieldError>{errors.employment_type.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Work Location Mode</FieldLabel>
              <Select
                value={workMode}
                disabled={!isEditing}
                onValueChange={onWorkModeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              {errors.work_mode && (
                <FieldError>{errors.work_mode.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Work Branch</FieldLabel>
              <Input
                {...register("work_branch")}
                disabled={!isEditing}
                placeholder="e.g. Bangalore HQ"
              />
              {errors.work_branch && (
                <FieldError>{errors.work_branch.message}</FieldError>
              )}
            </Field>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="contact"
        className="rounded-lg border border-border p-6 bg-background space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-2/20">
            <Phone className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="font-bold">Contact information</p>
            <p className="text-xs text-muted-foreground">
              Update your contact details and emergency contacts
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>Official Phone Number</FieldLabel>
            <Input
              {...register("official_phone")}
              disabled={!isEditing}
              placeholder="9876543210"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
            />
            {errors.official_phone && (
              <FieldError>{errors.official_phone.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Emergency Contact Name</FieldLabel>
            <Input
              {...register("emergency_contact_name")}
              disabled={!isEditing}
              placeholder="Contact person name"
            />
            {errors.emergency_contact_name && (
              <FieldError>{errors.emergency_contact_name.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Emergency Contact Relation</FieldLabel>
            <Input
              {...register("emergency_contact_relation")}
              disabled={!isEditing}
              placeholder="e.g. Spouse / Father"
            />
            {errors.emergency_contact_relation && (
              <FieldError>
                {errors.emergency_contact_relation.message}
              </FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Emergency Contact Phone</FieldLabel>
            <Input
              {...register("emergency_contact_phone")}
              disabled={!isEditing}
              placeholder="9876543210"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
            />
            {errors.emergency_contact_phone && (
              <FieldError>{errors.emergency_contact_phone.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Guardian Contact Name</FieldLabel>
            <Input
              {...register("guardian_contact_name")}
              disabled={!isEditing}
              placeholder="Guardian name"
            />
            {errors.guardian_contact_name && (
              <FieldError>{errors.guardian_contact_name.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Guardian Contact Relation</FieldLabel>
            <Input
              {...register("guardian_contact_relation")}
              disabled={!isEditing}
              placeholder="e.g. Mother / Father"
            />
            {errors.guardian_contact_relation && (
              <FieldError>
                {errors.guardian_contact_relation.message}
              </FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Guardian Contact Phone</FieldLabel>
            <Input
              {...register("guardian_contact_phone")}
              disabled={!isEditing}
              placeholder="9876543210"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
            />
            {errors.guardian_contact_phone && (
              <FieldError>{errors.guardian_contact_phone.message}</FieldError>
            )}
          </Field>
        </div>
      </TabsContent>
    </>
  );
}
