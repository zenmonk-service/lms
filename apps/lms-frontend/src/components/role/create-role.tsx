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

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";

import { LoaderCircle, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createOrganizationRoleAction,
  getOrganizationRolesAction,
} from "@/features/role/role.action";
import { Input } from "../ui/input";

const roleSchema = z.object({
  name: z
    .string()
    .trim().nonempty("Role name is required"),
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
    mode: "onChange",
  });

  const descriptionValue = watch("description");

  const onSubmit = async (data: FormData) => {
    await dispatch(createOrganizationRoleAction({ ...data, org_uuid }));

    dispatch(
      getOrganizationRolesAction({
        org_uuid,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          search: pagination.search?.trim(),
        },
      })
    );

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
      <Button
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white"
        size="sm"
      >
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

          {/* Content */}
          <div className="grid gap-4 overflow-y-auto max-h-96 no-scrollbar py-2">
            {/* Role Name */}
            <Field className="gap-1">
              <FieldLabel htmlFor="role-name">Role Name</FieldLabel>
              <Input
                {...register("name")}
                id="role-name"
                placeholder="Enter Role Name"
                aria-invalid={!!errors.name}
                className={
                  errors.name
                    ? "border-destructive ring-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.name && (
                <FieldError errors={[errors.name]} className="text-xs" />
              )}
            </Field>

            {/* Role Description */}
            <Field className="gap-1">
              <FieldLabel htmlFor="role-description">Description</FieldLabel>
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
              {errors.description && (
                <FieldError errors={[errors.description]} className="text-xs" />
              )}
            </Field>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={isLoading}
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? <LoaderCircle className="animate-spin"/> : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
