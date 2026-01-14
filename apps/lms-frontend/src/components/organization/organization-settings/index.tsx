"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon, Save } from "lucide-react";
import { useEffect, useState } from "react";
import IdentityBranding from "./identity-branding";
import Appearance from "./appearance";
import OperatingHours from "./operating-hours";
import IdentifierPatterns from "./identifier-patterns";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/features/organizations/organizations.action";
import { OrgManagementSkeleton } from "./skeleton";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  OrgAttendanceMethod,
  UserIdPattern,
  WorkDays,
} from "@/features/organizations/organizations.type";
import { zodResolver } from "@hookform/resolvers/zod";
import AttendanceMethod from "./attendance-method";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePathname, useRouter } from "next/navigation";

const orgSettings = z
  .object({
    theme: z.object({
      name: z.string(),
      value: z.string(),
      base: z.string(),
    }),
    attendance_method: z.enum(Object.values(OrgAttendanceMethod)),
    work_days: z
      .array(z.enum(Object.values(WorkDays)))
      .min(1, "At least one work day must be selected"),
    start_time: z.string().nonempty("Start time is required"),
    end_time: z.string().nonempty("End time is required"),
    employee_id_pattern_type: z.enum(Object.values(UserIdPattern)),
    employee_id_pattern_value: z
      .string()
      .nonempty("Employee ID pattern value is required"),
  })
  .refine(
    (data) => {
      return data.start_time < data.end_time;
    },
    {
      message: "Start time must be before end time",
      path: ["start_time"],
    }
  );

type OrgSettingsForm = z.infer<typeof orgSettings>;

const OrgManagement = () => {
  const router = useRouter();

  const { setTheme } = useTheme();
  const { organizationSettings, isLoading, currentOrganization } =
    useAppSelector((state) => state.organizationsSlice);
  const dispatch = useAppDispatch();

  const { control, handleSubmit, reset, formState } = useForm<OrgSettingsForm>({
    resolver: zodResolver(orgSettings),
    defaultValues: {
      theme: organizationSettings?.theme || {
        name: "Summer",
        value: "theme-summer",
        base: "#f66e60",
      },
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

  const [showAlert, setShowAlert] = useState(false);

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
    await dispatch(getOrganizationSettings(currentOrganization.uuid));
  };

  useEffect(() => {
    fetchOrgSettings();
  }, []);

  useEffect(() => {
    if (organizationSettings) {
      reset({
        theme: organizationSettings.theme,
        attendance_method: organizationSettings.attendance_method,
        work_days: organizationSettings.work_days,
        start_time: organizationSettings.start_time,
        end_time: organizationSettings.end_time,
        employee_id_pattern_type: organizationSettings.employee_id_pattern_type,
        employee_id_pattern_value:
          organizationSettings.employee_id_pattern_value,
      });
    }

    return () => {
      if (organizationSettings?.theme.value) {
        setTheme(organizationSettings.theme.value);
      }
    };
  }, [organizationSettings]);

  const onSubmit = async (data: OrgSettingsForm) => {
    await dispatch(
      updateOrganizationSettings({
        org_uuid: currentOrganization.uuid,
        settings: data,
      })
    );
    await fetchOrgSettings();
    setTheme(data.theme.value);
  };

  const handleCancel = () => {
    setShowAlert(false);
    router.back();
  };

  const handleContinue = () => {
    setShowAlert(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-3/4 min-[1400px]:w-1/2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sticky top-0 bg-background z-20 pt-6">
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold text-foreground">
                Organization Management
              </h1>
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
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your workspace identity, schedule, and global identifiers.
            </p>
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
              <Appearance control={control} />
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
      <Alert
        open={showAlert}
        onOpenChange={setShowAlert}
        handleCancel={handleCancel}
        handleContinue={handleContinue}
      />
    </div>
  );
};

const Alert = ({
  open,
  onOpenChange,
  handleContinue,
  handleCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleContinue: () => void;
  handleCancel: () => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrgManagement;
