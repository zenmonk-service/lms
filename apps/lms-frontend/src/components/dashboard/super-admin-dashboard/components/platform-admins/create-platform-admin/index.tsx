import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlatformAdminFormValues,
  platformAdminSchema,
} from "../../../super-admin.types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useAppDispatch, useAppSelector } from "@/store";
import { isUserExistAction } from "@/features/user/is-user-exist/is-user-exist.action";
import { createUserAction } from "@/features/user/create-user/create-user.action";
import { listOrganizationsAction } from "@/features/organizations/list-organizations/list-organization.action";
import { PublicRoleEnum } from "@/features/user/user.type";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  org_uuid: string;
}

const CreatePlatformAdmin = ({ open, onOpenChange, org_uuid }: IProps) => {
  const dispatch = useAppDispatch();
  const { isExistLoading, isUserExist, isLoading } = useAppSelector((state) => state.userSlice);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, reset, watch } =
    useForm<PlatformAdminFormValues>({
      resolver: zodResolver(platformAdminSchema),
      defaultValues: {
        name: "",
        email: "",
        password: "",
      },
    });

  const email = watch("email");
  const debouncedEmail = useDebounce(email, 700);

  useEffect(() => {
    dispatch(isUserExistAction(debouncedEmail));
  }, [debouncedEmail]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const transformData = (data: PlatformAdminFormValues) => {
    return {
      ...data,
      emp_code: "004",
      role: PublicRoleEnum.ADMIN,
      role_uuid: "a3b1c6d4-5f27-4e1a-8b3c-9d0f12345678", // ADMIN ROLE UUID
      shift_uuid: "e3b1c6d4-5f27-4e1a-8b3c-9d0f12345678", // Default shift UUID
    };
  };

  const onSubmit = async (data: PlatformAdminFormValues) => {
    const transformedData = transformData(data);
    await dispatch(createUserAction({ org_uuid, ...transformedData }));
    await dispatch(listOrganizationsAction({}));
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
            <DialogDescription>
              Please fill in the details below to create an admin for
              your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter name"
                    aria-invalid={fieldState.invalid}
                    maxLength={100}
                  />
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>
                    Email <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter email address"
                      aria-invalid={fieldState.invalid}
                      maxLength={100}
                    />
                    <InputGroupAddon align={"inline-end"}>
                      {isExistLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            {!isUserExist && <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>
                    Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup className="shadow-none">
                    <InputGroupInput
                      {...field}
                      id="password"
                      disabled={isExistLoading}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon
                      align={"inline-end"}
                      className=""
                    >
                      <Button
                        type="button"
                        size={"icon-sm"}
                        variant={"ghost"}
                        disabled={isExistLoading}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlatformAdmin;
