import { Briefcase, Phone, User } from "lucide-react";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

import { type EditUserFormData } from "./user-edit-page.types";

type UserEditPageProfileTabsProps = {
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
  return (
    <>
      <TabsContent value="basic" className="space-y-4">
        <div className="rounded-2xl border border-border/40 bg-linear-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/30 dark:to-slate-900/20 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="mb-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <p className="text-base font-bold text-foreground">Basic details</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                {...register("name")}
                disabled={!isEditing}
                placeholder="Enter full name"
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input {...register("email")} disabled placeholder="Enter email" />
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

          <div className="border-t border-border/40 pt-7 mt-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-950/30">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-base font-bold text-foreground">
                Employment details
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Designation / Job Title</FieldLabel>
                <Input
                  {...register("designation")}
                  disabled={!isEditing}
                  placeholder="e.g. Senior Software Engineer"
                />
                {errors.designation && (
                  <FieldError>{errors.designation.message}</FieldError>
                )}
              </Field>

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
        </div>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4">
        <div className="rounded-2xl border border-border/40 bg-linear-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/30 dark:to-slate-900/20 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="mb-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100/50 dark:bg-green-950/30">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-base font-bold text-foreground">
              Contact information
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Official Phone Number</FieldLabel>
              <Input
                {...register("official_phone")}
                disabled={!isEditing}
                placeholder="+91 98XXXXXXXX"
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
                placeholder="+91 98XXXXXXXX"
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
                <FieldError>{errors.guardian_contact_relation.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Guardian Contact Phone</FieldLabel>
              <Input
                {...register("guardian_contact_phone")}
                disabled={!isEditing}
                placeholder="+91 98XXXXXXXX"
              />
              {errors.guardian_contact_phone && (
                <FieldError>{errors.guardian_contact_phone.message}</FieldError>
              )}
            </Field>
          </div>
        </div>
      </TabsContent>
    </>
  );
}
