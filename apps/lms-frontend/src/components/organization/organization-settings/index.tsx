"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon, Save } from "lucide-react";
import { useEffect } from "react";
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
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import LeaveAllocation from "./components/leave-allocation";

const buildDefaultValues = (organizationSettings: OrganizationSettings | null): OrgSettingsForm => ({
  attendance_method: organizationSettings?.attendance_method || OrgAttendanceMethod.MANUAL,
  work_days: organizationSettings?.work_days || [],
  start_time: organizationSettings?.start_time || "",
  end_time: organizationSettings?.end_time || "",
  employee_id_mode: organizationSettings?.employee_id_pattern.type || EmployeeIdMode.MANUAL,
  employee_id_pattern_value: organizationSettings?.employee_id_pattern.value || [],
  balance: organizationSettings?.past_dated_leave?.balance || null,
  tenure: organizationSettings?.past_dated_leave?.tenure || undefined,
  sandwich_leave_exception: {
    isApplicable: organizationSettings?.sandwich_leave_exception?.isApplicable || false,
    roles: organizationSettings?.sandwich_leave_exception?.roles || [],
    users: organizationSettings?.sandwich_leave_exception?.users || [],
    tenure: organizationSettings?.sandwich_leave_exception?.tenure || undefined,
  },
  clubbing_leave_exception: {
    isApplicable: organizationSettings?.clubbing_leave_exception?.isApplicable || false,
    roles: organizationSettings?.clubbing_leave_exception?.roles || [],
    users: organizationSettings?.clubbing_leave_exception?.users || [],
    tenure: organizationSettings?.clubbing_leave_exception?.tenure || undefined,
  },
  leave_allocation_cutoff: {
    isApplicable: organizationSettings?.leave_allocation_cutoff?.isApplicable || false,
    cutoff: Number(organizationSettings?.leave_allocation_cutoff?.cutoff) || undefined,
    allocation_type: organizationSettings?.leave_allocation_cutoff?.allocation_type || undefined,
  }
});

const OrgManagement = () => {
  const dispatch = useAppDispatch();
  const { organizationSettings, isLoading, currentOrganization } =
    useAppSelector((state) => state.organizationsSlice);
  const can = usePermissionCheck();
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
    const { employee_id_mode, employee_id_pattern_value, ...rest } = data;

    const employee_id_pattern = {
      type: employee_id_mode,
      ...(employee_id_mode === EmployeeIdMode.AUTO && {
        value: employee_id_pattern_value,
      }),
    };

    await dispatch(
      updateOrganizationSettingsAction({
        org_uuid: currentOrganization.uuid,
        ...rest,
        employee_id_pattern,
        ...(data.tenure
          ? {
              past_dated_leave: {
                balance: data.balance,
                tenure: data.tenure,
              },
            }
          : { past_dated_leave: null }),
        ...(data?.sandwich_leave_exception?.isApplicable
          ? {
              sandwich_leave_exception: {
                ...data.sandwich_leave_exception,
                tenure: data.sandwich_leave_exception.tenure,
              },
            }
          : { sandwich_leave_exception: null }),
        ...(data?.clubbing_leave_exception?.isApplicable
          ? {
              clubbing_leave_exception: {
                ...data.clubbing_leave_exception,
                tenure: data.clubbing_leave_exception.tenure,
              },
            }
          : { clubbing_leave_exception: null }),
      }),
    );
    await fetchOrgSettings();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, (error) => console.log("error ==> ", error))}>
        <div className="sticky top-0 bg-background z-20 pt-6">
          <Title
            title={{ text: "Organization Management" }}
            description={{ text: "Manage your workspace identity, schedule, and global identifiers." }}
            button={
              can(PermissionTag.ORGANIZATION_SETTING_MANAGEMENT, PermissionAction.UPDATE) && (
                <Button
                  type="submit"
                  size={"sm"}
                  className="cursor-pointer"
                  disabled={isLoading || !formState.isDirty}
                >
                  {isLoading ? <Loader2Icon className="animate-spin" /> : <Save />}
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
            <IdentifierPatterns />
            <Separator />
            <SandwichAllowed />
            <Separator />
            <ClubbingAllowed />
            <Separator />
            <LeaveAllocation />
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
