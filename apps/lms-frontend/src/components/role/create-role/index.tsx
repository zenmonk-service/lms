"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";

import { LoaderCircle, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "../../ui/input";
import { createOrganizationRoleAction } from "@/features/role/create-organization-role/create-organization-role.action";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";

const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Role name is required")
    .max(60, "Role name must be at most 60 characters"),
  code: z
    .string()
    .trim()
    .nonempty("Code is required")
    .max(10, "Code must be at most 60 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description must be at most 200 characters"),
});

type FormData = z.infer<typeof roleSchema>;

export default function CreateRole({ org_uuid }: { org_uuid: string }) {
  const dispatch = useAppDispatch();
  const { pagination, isLoading } = useAppSelector((state) => state.rolesSlice);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onSubmit",
  });

  const descriptionValue = watch("description");

  const onSubmit = async (data: FormData) => {
    try{
      await dispatch(createOrganizationRoleAction({ ...data, org_uuid })).unwrap();
      dispatch(getOrganizationRolesAction({ org_uuid }));
    } catch (err) {}

    setOpen(false);
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button onClick={() => setOpen(true)} size="sm">
        <UserPlus className="w-5 h-5" />
        Create Role
      </Button>

      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>
              Provide the role name and description to create a new role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 overflow-y-auto max-h-96 no-scrollbar py-2">
            <Field className="gap-1">
              <FieldLabel htmlFor="role-name">
                Role Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register("name")}
                id="role-name"
                placeholder="Enter Role Name"
                maxLength={60}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} className="text-xs" />
            </Field>

            <Field className="gap-1">
              <FieldLabel htmlFor="code">
                Code <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register("code", {
                  setValueAs: (value) =>
                    typeof value === "string"
                      ? value.toUpperCase().trim()
                      : value,
                })}
                id="code"
                placeholder="e.g., (SDE-1)"
                className="uppercase placeholder:normal-case"
                maxLength={10}
                aria-invalid={!!errors.code}
              />
              <FieldError errors={[errors.code]} className="text-xs" />
            </Field>

            <Field className="gap-1">
              <FieldLabel htmlFor="role-description">
                Description <span className="text-destructive">*</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...register("description")}
                  id="role-description"
                  placeholder="Describe the purpose of this role..."
                  rows={4}
                  className="min-h-20 resize-none"
                  aria-invalid={!!errors.description}
                  maxLength={200}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {descriptionValue?.length || 0}/200 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[errors.description]} className="text-xs" />
            </Field>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
