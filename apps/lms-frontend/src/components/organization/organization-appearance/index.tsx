"use client";

import React, { useEffect, useState } from "react";
import Appearance from "./components/appearance";
import z from "zod";
import { useTheme } from "next-themes";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import AppearanceSkeleton from "./components/skeleton";
import { getOrganizationSettingsAction } from "@/features/organizations/get-organization-settings/get-organization-settings.action";
import { updateOrganizationSettingsAction } from "@/features/organizations/update-organization-settings/update-organization-settings.action";

const appearance = z.object({
  theme: z.object({
    name: z.string(),
    value: z.string(),
    base: z.string(),
  }),
});

type AppearanceType = z.infer<typeof appearance>;

const OrgAppearance = () => {
  const { setTheme } = useTheme();
  const dispatch = useAppDispatch();

  const { organizationSettings, currentOrganization, isLoading } =
    useAppSelector((state) => state.organizationsSlice);

  const [loading, setLoading] = useState(false);

  const fetchOrgSettings = async () => {
    setLoading(true);
    await dispatch(getOrganizationSettingsAction({ org_uuid: currentOrganization.uuid }));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgSettings();
  }, []);

  const methods = useForm<AppearanceType>({
    resolver: zodResolver(appearance),
    defaultValues: {
      theme: organizationSettings?.theme || {
        name: "Summer",
        value: "theme-summer",
        base: "#f66e60",
      },
    },
  });

  useEffect(() => {
    if (organizationSettings)
      methods.reset({
        theme: organizationSettings.theme,
      });
    return () => {
      if (organizationSettings?.theme.value) {
        setTheme(organizationSettings.theme.value);
      }
    };
  }, [organizationSettings]);

  const onSubmit = async (data: AppearanceType) => {
    await dispatch(
      updateOrganizationSettingsAction({
        org_uuid: currentOrganization.uuid,
        ...data,
      }),
    );
    await dispatch(getOrganizationSettingsAction({ org_uuid: currentOrganization.uuid }));
    await setTheme(data.theme.value);
  };

  return (
    <div className="w-3/4 min-[1400px]:w-1/2 mx-auto">
      {loading ? (
        <AppearanceSkeleton />
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Appearance className="p-6" isLoading={isLoading} />
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default OrgAppearance;
