"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon, Save } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { FormProvider, useForm } from "react-hook-form";
import {
  EmployeeIdMode,
  OrganizationSettings,
  OrgAttendanceMethod,
} from "@/features/organizations/organizations.types";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/shared/typography/title";
import { orgSettings, OrgSettingsForm } from "../organization.types";
import { getOrganizationSettingsAction } from "@/features/organizations/get-organization-settings/get-organization-settings.action";
import { updateOrganizationSettingsAction } from "@/features/organizations/update-organization-settings/update-organization-settings.action";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { useNavigationGuard } from "@/shared/hooks/user-navigation-guard";
import { minutesToTimeString } from "@/utils/minutes-to-time";
import { timeStringToMinutes } from "@/utils/time-to-minutes";
import AttendanceMethod from "../shared/attendance-method";
import ClubbingAllowed from "../shared/clubbing";
import FlexibleTime from "../shared/flexible-time";
import IdentifierPatterns from "../shared/identifier-patterns";
import LateExceptionSettings from "../shared/late-exception";
import LeaveAllocation from "../shared/leave-allocation";
import OperatingHours from "../shared/operating-hours";
import PastDatedLeaveSettings from "../shared/past-dated-leaves";
import SandwichAllowed from "../shared/sandwich";
import { OrgManagementSkeleton } from "../shared/skeleton";
import IdentityBranding from "../shared/identity-branding";
import NoPermission from "@/shared/no-permission";

const OrgManagement = () => {
  const dispatch = useAppDispatch();
  const can = usePermissionCheck();

  if (
    !can(PermissionTag.ORGANIZATION_SETTING_MANAGEMENT, PermissionAction.READ)
  ) {
    return <NoPermission moduleName="Organization Settings" />;
  }

  const { organizationSettings, isLoading, currentOrganization } =
    useAppSelector((state) => state.organizationsSlice);

  const buildDefaultValues = useCallback(
    (organizationSettings: OrganizationSettings | null): OrgSettingsForm => ({
      attendance_method:
        organizationSettings?.attendance_method || OrgAttendanceMethod.MANUAL,
      work_days: organizationSettings?.work_days || [],
      start_time: organizationSettings?.start_time || "",
      end_time: organizationSettings?.end_time || "",
      employee_id_mode:
        organizationSettings?.employee_id_pattern?.type || EmployeeIdMode.MANUAL,
      employee_id_pattern_value:
        organizationSettings?.employee_id_pattern?.value || [],
      balance: organizationSettings?.past_dated_leave?.balance ?? null,
      tenure: organizationSettings?.past_dated_leave?.tenure ?? "",
      sandwich_leave_exception: {
        is_applicable:
          organizationSettings?.sandwich_leave_exception?.is_applicable ||
          false,
        tenure: organizationSettings?.sandwich_leave_exception?.tenure ?? "",
        balance: organizationSettings?.sandwich_leave_exception?.balance || 0,
      },
      clubbing_leave_exception: {
        is_applicable:
          organizationSettings?.clubbing_leave_exception?.is_applicable ||
          false,
        tenure: organizationSettings?.clubbing_leave_exception?.tenure ?? "",
        balance: organizationSettings?.clubbing_leave_exception?.balance || 0,
      },
      leave_allocation_policy: {
        is_applicable: organizationSettings?.leave_allocation_policy !== null,
        cut_off: organizationSettings?.leave_allocation_policy?.cut_off ?? null,
      },
      late_exception: {
        is_applicable: organizationSettings?.late_exception?.is_applicable || false,
        tenure: organizationSettings?.late_exception?.tenure ?? "",
        balance: organizationSettings?.late_exception?.balance || 0,
        time: organizationSettings?.late_exception?.grace_duration ? minutesToTimeString(organizationSettings.late_exception.grace_duration) : "00:00",
      },
      flexible_time: organizationSettings?.flexible_time ? minutesToTimeString(organizationSettings.flexible_time) : "00:00",
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
    await dispatch(getOrganizationSettingsAction({ org_uuid: currentOrganization.uuid }));
  };

  useEffect(() => {
    dispatch(getOrganizationRolesAction({ org_uuid: currentOrganization.uuid }));
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
    const pastDatedLeave = data.tenure ? { balance: data.balance, tenure: data.tenure } : null;

    const { is_applicable, tenure, balance, time } = data.late_exception;
    const lateException = is_applicable
      ? {
          is_applicable,
          tenure,
          balance,
          grace_duration: timeStringToMinutes(time!)
        }
      : null;

    const payload = {
      ...rest,
      employee_id_pattern,
      late_exception: lateException,
      past_dated_leave: pastDatedLeave,
      org_uuid: currentOrganization.uuid,
      flexible_time: data.flexible_time != null ? timeStringToMinutes(data.flexible_time) : null,
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="sticky top-0 bg-background z-20 pt-6">
          <Title
            title={{ text: "Organization Management" }}
            description={{ text: "Manage your workspace identity, schedule, and global identifiers." }}
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

        {(isLoading || !organizationSettings) ? (
          <OrgManagementSkeleton />
        ) : (
          <div className="space-y-6 mt-6">
            <IdentityBranding
              org_name={currentOrganization.name}
              domain={currentOrganization.domain}
              logo_url={currentOrganization.logo_url}
            />
            <Separator />
            {(isLoading || !organizationSettings) ? (
              <OrgManagementSkeleton />
            ) : (
              <>
                <OperatingHours />
                <Separator />
                <FlexibleTime />
                <Separator />
                <LeaveAllocation />
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
              </>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default OrgManagement;
