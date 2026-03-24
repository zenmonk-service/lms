"use client";

import React, { useEffect, useState } from "react";
import Appearance from "./appearance";
import z from "zod";
import { useTheme } from "next-themes";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/features/organizations/organizations.action";
import AppearanceSkeleton from "./skeleton";

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
    await dispatch(getOrganizationSettings(currentOrganization.uuid));
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
      updateOrganizationSettings({
        org_uuid: currentOrganization.uuid,
        settings: data,
      }),
    );
    await dispatch(getOrganizationSettings(currentOrganization.uuid));
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
