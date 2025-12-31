"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  UserPlus,
  Mail,
  Lock,
  User,
  Users,
  EditIcon,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { createUser, updateUser } from "@/features/user/user.service";
import {
  setIsUserExist,
  setPagination,
  UserInterface,
} from "@/features/user/user.slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import {
  isUserExistAction,
  listUserAction,
  updateUserAction,
} from "@/features/user/user.action";
import { createUserAction } from "@/features/organizations/organizations.action";

export default function CreateUser({
  org_uuid,
  isEdited = false,
  userData,
}: {
  org_uuid: string;
  isEdited?: boolean;
  userData?: UserInterface;
}) {
  const dispatch = useAppDispatch();
  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const { isUserExist, isExistLoading ,isLoading } = useAppSelector(
    (state) => state.userSlice
  );

  const [selectedRole, setSelectedRole] = useState(
    isEdited ? (userData ? userData.role.uuid : "") : ""
  );
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: isEdited
      ? z.string().trim().optional()
      : z.string().trim().nonempty("Email is required").email("Enter a valid email address"),
    password:
      isUserExist || isEdited
        ? z.string().trim().optional()
        : z.string().trim().min(1, "Password is required"),
    role: z.string().trim().min(1, "Role is required"),
  });

  type FormData = z.infer<typeof userSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: isEdited && userData ? userData.name : "",
      email: isEdited && userData ? userData.email : "",
      password: "",
      role: isEdited && userData ? userData.role.uuid : "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: FormData) => {
    if (isEdited && userData) {
      await dispatch(
        updateUserAction({
          name: data.name,
          role: data.role,
          user_uuid: userData.user_id,
          org_uuid: org_uuid,
        })
      );
      dispatch(
        listUserAction({ org_uuid, pagination: { page: 1, limit: 10 } })
      );
      dispatch(setPagination({ page: 1, limit: 10 }));
      setOpen(false);
    } else {
      await dispatch(
        createUserAction({
          name: data.name,
          email: data.email?.trim() || "",
          // only send password when user is NOT already present
          ...(!isUserExist && { password: data.password ?? "" }),
          org_uuid,
          role_uuid: data.role,
          role: "user",
        })
      );
      dispatch(
        listUserAction({ org_uuid, pagination: { page: 1, limit: 10 } })
      );
      dispatch(setPagination({ page: 1, limit: 10 }));
      setOpen(false);
    }
    reset();
    setSelectedRole("");
    dispatch(setIsUserExist(false));
  };

  useEffect(() => {
    if (open) {
      dispatch(getOrganizationRolesAction({ org_uuid }));
    }
  }, [org_uuid, open, dispatch]);

  useEffect(() => {
    const isValidEmail = emailValue && !isEdited;

    if (!isValidEmail) {
      return;
    }

    const handler = setTimeout(() => {
      dispatch(isUserExistAction(emailValue.trim()));
    }, 500);

    return () => clearTimeout(handler);
  }, [emailValue, isEdited]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        reset();
        setSelectedRole("");
        dispatch(setIsUserExist(false));
      }}
    >
      <Button
        size="sm"
        onClick={() => setOpen(true)}
      >
        {isEdited ? (
          <>
            <EditIcon className="w-5 h-5" /> Edit User
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" /> Create User
          </>
        )}
      </Button>

      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdited ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {isEdited
                ? "Edit the user's details and assign a new role."
                : "Add a new user by providing their details and assigning a role."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 overflow-y-auto max-h-96 no-scrollbar py-2">
            {/* Full Name */}
            <Field data-invalid={!!errors.name} className="gap-1">
              <FieldLabel htmlFor="user-name">Full Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="user-name"
                  placeholder="Enter user's full name"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <InputGroupAddon>
                  <InputGroupText>
                    <User className="w-4 h-4 text-orange-500" />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.name && (
                <FieldError errors={[errors.name]} className="text-xs" />
              )}
            </Field>
            {/* Email (only when creating and not editing) */}
            {!isEdited && (
              <Field data-invalid={!!errors.email} className="gap-1">
                <FieldLabel htmlFor="user-email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <InputGroupAddon>
                    <InputGroupText className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                    </InputGroupText>
                  </InputGroupAddon>

                  <InputGroupAddon align={"inline-end"}>
                    <InputGroupText className="flex items-center gap-2">
                      {isExistLoading && (
                        <>
                          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                          <span className="text-xs text-gray-600">
                            Checking!
                          </span>
                        </>
                      )}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {errors.email && (
                  <FieldError errors={[errors.email]} className="text-xs" />
                )}
              </Field>
            )}
            {/* Password (only when creating and user is not present) */}
            {!isEdited && !isUserExist && (
              <Field data-invalid={!!errors.password} className="gap-1">
                <FieldLabel htmlFor="user-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <InputGroupAddon>
                    <InputGroupText>
                      <Lock className="w-4 h-4 text-orange-500" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupText
                      className="cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={0}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-orange-500" />
                      )}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                {errors.password && (
                  <FieldError errors={[errors.password]} className="text-xs" />
                )}
              </Field>
            )}
            {/* Role Selection */}
            <Field data-invalid={!!errors.role} className="gap-1">
              <FieldLabel>Assign Role</FieldLabel>
              <Select
                value={selectedRole}
                onValueChange={(val) => {
                  setSelectedRole(val);
                  setValue("role", val, { shouldValidate: true });
                  trigger("role");
                }}
              >
                <SelectTrigger
                  className={
                    errors.role
                      ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.uuid} value={role.uuid}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <FieldError errors={[errors.role]} className="text-xs" />
              )}
              {selectedRole && (
                <p className="text-xs text-green-600 mt-1">
                  {roles.find((r: any) => r.uuid === selectedRole)?.description}
                </p>
              )}
            </Field>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={isExistLoading || isLoading}
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
            >
              {isExistLoading || isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEdited ? (
                "Edit User"
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
