"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema, type EditUserFormData } from "../user.types";
import { UserInterface } from "@/features/user/user.type";

function buildDefaultValues(user: UserInterface | null): EditUserFormData {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    role_uuid: user?.role?.uuid ?? "",
    shift_uuid: user?.organization_shift?.uuid ?? "",

    work_mode: user?.work_mode || undefined,
    work_branch: user?.work_branch ?? "",
    employment_type: user?.employment_type || undefined,

    personal_information: {
      dob: user?.personal_information?.dob ?? "",
      gender: user?.personal_information?.gender || undefined,
      phone_number: user?.personal_information?.phone_number ?? "",
      current_address: user?.personal_information?.current_address ?? "",
      permanent_address: user?.personal_information?.permanent_address ?? "",
      marital_status: user?.personal_information?.marital_status || undefined,

      parent_information: {
        father_name:
          user?.personal_information?.parent_information?.father_name ?? "",
        mother_name:
          user?.personal_information?.parent_information?.mother_name ?? "",
        father_phone:
          user?.personal_information?.parent_information?.father_phone ?? "",
        mother_phone:
          user?.personal_information?.parent_information?.mother_phone ?? "",
      },

      guardian_information: {
        guardian_name:
          user?.personal_information?.guardian_information?.guardian_name ?? "",
        guardian_relation:
          user?.personal_information?.guardian_information?.guardian_relation || undefined,
        guardian_phone:
          user?.personal_information?.guardian_information?.guardian_phone ?? "",
      },
    },
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