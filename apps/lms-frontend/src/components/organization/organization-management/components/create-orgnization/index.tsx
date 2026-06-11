"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { Loader2 } from "lucide-react";
import { createOrganizationAction } from "@/features/organizations/create-organization/create-organization.action";
import { listOrganizationsAction } from "@/features/organizations/list-organizations/list-organization.action";
import { toastError } from "@/shared/toast/toast-error";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { OrgFormValues, orgSchema } from "@/components/organization/organization.types";
interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search?: string;
}

export default function CreateOrganizationForm({
  open,
  onOpenChange,
  search,
}: IProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.organizationsSlice);

  const { control, reset, handleSubmit } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
    },
  });

  const onSubmit = async (data: OrgFormValues) => {
    try {
      await dispatch(createOrganizationAction(data));
      await dispatch(
        listOrganizationsAction({ params: { page: 1, limit: 10, search } }),
      );
      handleClose();
    } catch (err) {
      toastError("Failed to create organization. Please try again.");
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Organization</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new organization.
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

            <div className="grid gap-3">
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1 truncate">
                    <FieldLabel>Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        placeholder="Short description about your organization"
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                        maxLength={255}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field?.value?.length || 0}/255 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Briefly describe the organization.
                    </FieldDescription>
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
