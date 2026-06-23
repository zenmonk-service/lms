"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema, type EditUserFormData } from "../user.types";
import { UserInterface } from "@/features/user/user.type";

function buildDefaultValues(user: UserInterface | null): EditUserFormData {
  return {
    name: user?.name || "",
    role: user?.role?.uuid || "",
    shift: user?.organization_shift?.uuid || "",
    email: user?.email || "",
    marital_status: user?.personal_information?.marital_status || undefined,
    employment_type: user?.personal_information?.employment_type || undefined,
    work_mode: user?.personal_information?.work_mode || undefined,
    work_branch: user?.personal_information?.work_branch || "",
    official_phone: user?.personal_information?.official_phone || "",
    emergency_contact_name: user?.personal_information?.emergency_contact_name || "",
    emergency_contact_relation: user?.personal_information?.emergency_contact_relation || "",
    emergency_contact_phone: user?.personal_information?.emergency_contact_phone || "",
    guardian_contact_name: user?.personal_information?.guardian_contact_name || "",
    guardian_contact_relation: user?.personal_information?.guardian_contact_relation || "",
    guardian_contact_phone: user?.personal_information?.guardian_contact_phone || "",
  };
}

export function useUserEditForm(selectedUser: UserInterface | null) {
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: buildDefaultValues(null),
  });

  useEffect(() => {
    if (selectedUser) form.reset(buildDefaultValues(selectedUser));
  }, [selectedUser]);

  return {
    form,
    resetToSelectedUser: () => selectedUser && form.reset(buildDefaultValues(selectedUser)),
  };
}