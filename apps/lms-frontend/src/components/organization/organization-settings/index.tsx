"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon, Save } from "lucide-react";
import { useCallback, useEffect } from "react";
import IdentityBranding from "./components/identity-branding";
import OperatingHours from "./components/operating-hours";
import IdentifierPatterns from "./components/identifier-patterns";
import { useAppDispatch, useAppSelector } from "@/store";
import { OrgManagementSkeleton } from "./components/skeleton";
import { FormProvider, useForm } from "react-hook-form";
import {
  EmployeeIdMode,
  OrganizationSettings,
  OrgAttendanceMethod,
} from "@/features/organizations/organizations.types";
import { zodResolver } from "@hookform/resolvers/zod";
import AttendanceMethod from "./components/attendance-method";
import Title from "@/shared/typography/title";
import { orgSettings, OrgSettingsForm } from "../organization.types";
import { getOrganizationSettingsAction } from "@/features/organizations/get-organization-settings/get-organization-settings.action";
import { updateOrganizationSettingsAction } from "@/features/organizations/update-organization-settings/update-organization-settings.action";
import PastDatedLeaveSettings from "./components/past-dated-leaves";
import { useNavigationGuard } from "@/shared/hooks/user-navigation-guard";
import SandwichAllowed from "./components/sandwich";
import ClubbingAllowed from "./components/clubbing";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import LeaveAllocation from "./components/leave-allocation";
import LateExceptionSettings from "./components/late-exception";
import FlexibleTime from "./components/flexible-time";

export const createTimeDate = (totalMinutes?: string) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (totalMinutes) {
    const hours = Math.floor(Number(totalMinutes) / 60);
    const minutes = Number(totalMinutes) % 60;
    date.setHours(hours);
    date.setMinutes(minutes);
  }
  return date;
};

const OrgManagement = () => {
  const dispatch = useAppDispatch();
  const { organizationSettings, isLoading, currentOrganization } =
    useAppSelector((state) => state.organizationsSlice);
  const can = usePermissionCheck();

  const buildDefaultValues = useCallback(
    (organizationSettings: OrganizationSettings | null): OrgSettingsForm => ({
      attendance_method:
        organizationSettings?.attendance_method || OrgAttendanceMethod.MANUAL,
      work_days: organizationSettings?.work_days || [],
      start_time: organizationSettings?.start_time || "",
      end_time: organizationSettings?.end_time || "",
      employee_id_mode:
        organizationSettings?.employee_id_pattern.type || EmployeeIdMode.MANUAL,
      employee_id_pattern_value:
        organizationSettings?.employee_id_pattern.value || [],
      balance: organizationSettings?.past_dated_leave?.balance || null,
      tenure: organizationSettings?.past_dated_leave?.tenure || undefined,
      sandwich_leave_exception: {
        is_applicable:
          organizationSettings?.sandwich_leave_exception?.is_applicable ||
          false,
        roles: organizationSettings?.sandwich_leave_exception?.roles || [],
        users: organizationSettings?.sandwich_leave_exception?.users || [],
        tenure:
          organizationSettings?.sandwich_leave_exception?.tenure || undefined,
        balance: organizationSettings?.sandwich_leave_exception?.balance || 0,
      },
      clubbing_leave_exception: {
        is_applicable:
          organizationSettings?.clubbing_leave_exception?.is_applicable ||
          false,
        roles: organizationSettings?.clubbing_leave_exception?.roles || [],
        users: organizationSettings?.clubbing_leave_exception?.users || [],
        tenure:
          organizationSettings?.clubbing_leave_exception?.tenure || undefined,
        balance: organizationSettings?.clubbing_leave_exception?.balance || 0,
      },
      leave_allocation_policy: {
        is_applicable: organizationSettings?.leave_allocation_policy !== null,
        cut_off: organizationSettings?.leave_allocation_policy?.cut_off ?? null,
      },
      late_exception: {
        is_applicable:
          organizationSettings?.late_exception?.is_applicable || false,
        tenure: organizationSettings?.late_exception?.tenure || undefined,
        balance: organizationSettings?.late_exception?.balance || undefined,
        time: organizationSettings?.late_exception?.grace_duration
          ? new Date(
              createTimeDate(
                organizationSettings.late_exception.grace_duration,
              ),
            )
          : null,
      },
      flexible_time: organizationSettings?.flexible_time
        ? new Date(createTimeDate(organizationSettings.flexible_time))
        : null,
    }),
    [organizationSettings],
  );

  const methods = useForm<OrgSettingsForm>({
    resolver: zodResolver(orgSettings),
    defaultValues: buildDefaultValues(organizationSettings),
  });

  const { handleSubmit, reset, formState } = methods;

  useNavigationGuard(formState.isDirty);

  const fetchOrgSettings = async () => {
    await dispatch(
      getOrganizationSettingsAction({ org_uuid: currentOrganization.uuid }),
    );
  };

  useEffect(() => {
    fetchOrgSettings();
  }, []);

  useEffect(() => {
    if (organizationSettings) reset(buildDefaultValues(organizationSettings));
  }, [organizationSettings, reset]);

  const onSubmit = async (data: OrgSettingsForm) => {
    const {
      employee_id_mode,
      employee_id_pattern_value,
      leave_allocation_policy,
      ...rest
    } = data;

    const employee_id_pattern = {
      type: employee_id_mode,
      ...(employee_id_mode === EmployeeIdMode.AUTO && {
        value: employee_id_pattern_value,
      }),
    };
    const pastDatedLeave = data.tenure
      ? { balance: data.balance, tenure: data.tenure }
      : null;
    const lateException = data.late_exception?.is_applicable
      ? {
          ...data.late_exception,
          grace_duration: data.late_exception.time
            ? data.late_exception.time.getHours() * 60 +
              data.late_exception.time.getMinutes()
            : null,
        }
      : null;

    const payload = {
      ...rest,
      employee_id_pattern,
      late_exception: lateException,
      past_dated_leave: pastDatedLeave,
      org_uuid: currentOrganization.uuid,
      flexible_time: data?.flexible_time
        ? data.flexible_time.getHours() * 60 + data.flexible_time.getMinutes()
        : null,
      leave_allocation_policy: leave_allocation_policy?.is_applicable
        ? { cut_off: leave_allocation_policy.cut_off }
        : null,
      sandwich_leave_exception: data.sandwich_leave_exception?.is_applicable
        ? data.sandwich_leave_exception
        : null,
      clubbing_leave_exception: data.clubbing_leave_exception?.is_applicable
        ? data.clubbing_leave_exception
        : null,
    };

    try {
      await dispatch(updateOrganizationSettingsAction(payload)).unwrap();
      await fetchOrgSettings();
    } catch (error) {}
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, (error) =>
          console.log("Form validation errors:", error),
        )}
      >
        <div className="sticky top-0 bg-background z-20 pt-6">
          <Title
            title={{ text: "Organization Management" }}
            description={{
              text: "Manage your workspace identity, schedule, and global identifiers.",
            }}
            button={
              can(
                PermissionTag.ORGANIZATION_SETTING_MANAGEMENT,
                PermissionAction.UPDATE,
              ) && (
                <Button
                  type="submit"
                  size={"sm"}
                  className="cursor-pointer"
                  disabled={isLoading || !formState.isDirty}
                >
                  {isLoading ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  <span className="hidden sm:block">Save</span>
                </Button>
              )
            }
          />
          <Separator className="mt-6" />
        </div>

        {isLoading || !organizationSettings ? (
          <OrgManagementSkeleton />
        ) : (
          <div className="space-y-6 mt-6">
            <IdentityBranding
              org_name={currentOrganization.name}
              domain={currentOrganization.domain}
              logo_url={currentOrganization.logo_url}
            />
            <Separator />
            <OperatingHours />
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FlexibleTime />
              <LeaveAllocation />
            </div>
            <Separator />
            <LateExceptionSettings />
            <Separator />
            <IdentifierPatterns />
            <Separator />
            <SandwichAllowed />
            <Separator />
            <ClubbingAllowed />
            <Separator />
            <PastDatedLeaveSettings />
            <Separator />
            <AttendanceMethod />
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default OrgManagement;
