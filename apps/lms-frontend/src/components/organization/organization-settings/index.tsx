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
import { useForm } from "react-hook-form";
import {
  OrgAttendanceMethod,
  UserIdPattern,
} from "@/features/organizations/organizations.types";
import { zodResolver } from "@hookform/resolvers/zod";
import AttendanceMethod from "./components/attendance-method";
import Title from "@/shared/typography/title";
import { orgSettings, OrgSettingsForm } from "../organization.types";
import { getOrganizationSettingsAction } from "@/features/organizations/get-organization-settings/get-organization-settings.action";
import { updateOrganizationSettingsAction } from "@/features/organizations/update-organization-settings/update-organization-settings.action";

const OrgManagement = () => {
  const dispatch = useAppDispatch();
  const { organizationSettings, isLoading, currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const { control, handleSubmit, reset, formState } = useForm<OrgSettingsForm>({
    resolver: zodResolver(orgSettings),
    defaultValues: {
      attendance_method:
        organizationSettings?.attendance_method || OrgAttendanceMethod.MANUAL,
      work_days: organizationSettings?.work_days || [],
      start_time: organizationSettings?.start_time || "",
      end_time: organizationSettings?.end_time || "",
      employee_id_pattern_type:
        organizationSettings?.employee_id_pattern_type ||
        UserIdPattern.ALPHA_NUMERIC,
      employee_id_pattern_value:
        organizationSettings?.employee_id_pattern_value || "",
    },
  });

  const handlePageReload = (e: BeforeUnloadEvent) => {
    if (
      formState.dirtyFields &&
      Object.keys(formState.dirtyFields).length > 0
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handlePageReload);
    return () => {
      window.removeEventListener("beforeunload", handlePageReload);
    };
  }, [formState.dirtyFields]);

  const fetchOrgSettings = async () => {
    await dispatch(getOrganizationSettingsAction({ org_uuid: currentOrganization.uuid }));
  };

  useEffect(() => {
    fetchOrgSettings();
  }, []);

  useEffect(() => {
    if (organizationSettings) {
      reset({
        attendance_method: organizationSettings.attendance_method,
        work_days: organizationSettings.work_days,
        start_time: organizationSettings.start_time,
        end_time: organizationSettings.end_time,
        employee_id_pattern_type: organizationSettings.employee_id_pattern_type,
        employee_id_pattern_value:
          organizationSettings.employee_id_pattern_value,
      });
    }
  }, [organizationSettings]);

  const onSubmit = async (data: OrgSettingsForm) => {
    await dispatch(
      updateOrganizationSettingsAction({
        org_uuid: currentOrganization.uuid,
        ...data,
      }),
    );
    await fetchOrgSettings();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-3/4 min-[1400px]:w-1/2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sticky top-0 bg-background z-20 pt-6">
            <Title
              title={{
                text: "Organization Management",
                className: "",
              }}
              description={{
                text: "Manage your workspace identity, schedule, and global identifiers.",
                className: "",
              }}
              className=""
              button={
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
                  Save changes
                </Button>
              }
            />
            <Separator className="mt-6" />
          </div>

          {isLoading || !organizationSettings ? (
            <OrgManagementSkeleton />
          ) : (
            <div className="flex flex-col gap-12 mt-12">
              <IdentityBranding
                org_name={currentOrganization.name}
                domain={currentOrganization.domain}
                logo_url={currentOrganization.logo_url}
              />
              <Separator />
              <OperatingHours control={control} />
              <Separator />
              <IdentifierPatterns control={control} />
              <Separator />
              <AttendanceMethod control={control} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrgManagement;
