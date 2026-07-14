"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { LoaderCircle } from "lucide-react";
import { createOrganizationAction } from "@/features/organizations/create-organization/create-organization.action";
import { listOrganizationsAction } from "@/features/organizations/list-organizations/list-organization.action";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  OrgFormValues,
  orgSchema,
} from "@/components/organization/organization.types";
import { Organization } from "@/features/organizations/organizations.types";
import { updateOrganizationAction } from "@/features/organizations/update-organization/update-organization.action";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization;
}

export default function CreateOrganizationForm({
  open,
  onOpenChange,
  organization,
}: IProps) {
  const isEditMode = Boolean(organization);

  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const { control, reset, handleSubmit } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      domain: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    reset({
      name: organization?.name ?? "",
      domain: organization?.domain ?? "",
    });
  }, [open, organization, reset]);

  const onSubmit = async (data: OrgFormValues) => {
    setIsLoading(true);
    if (isEditMode) {
      await dispatch(updateOrganizationAction({ org_uuid: organization!.uuid, ...data }));
    } else await dispatch(createOrganizationAction(data));

    await dispatch(listOrganizationsAction({}));
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Organization" : "Create a new Organization"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the organization's details below."
              : "Fill in the details to create a new organization."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>
                    Organization Name{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. ZenMonk Technologies"
                    aria-invalid={fieldState.invalid}
                    maxLength={100}
                  />
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="domain"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>
                    Domain <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. zenmonk.com"
                    aria-invalid={fieldState.invalid}
                    maxLength={100}
                  />
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
