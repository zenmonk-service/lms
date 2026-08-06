"use client";

import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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
  LoaderCircle,
  Eye,
  EyeOff,
  ScanQrCode,
  Dot,
} from "lucide-react";
import { setIsUserExist, setPagination } from "@/features/user/user.slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { isUserExistAction } from "@/features/user/is-user-exist/is-user-exist.action";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { createUserAction } from "@/features/user/create-user/create-user.action";
import { PublicRoleEnum } from "@/features/user/user.type";
import CaptureFacePhoto from "./capture-face";
import { EmployeeIdMode } from "@/features/organizations/organizations.types";
import { getOrganizationSettingsAction } from "@/features/organizations/get-organization-settings/get-organization-settings.action";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { generateEmployeeCodeAction } from "@/features/user/generate-employee-code/generate-employee-code.action";

export default function CreateUser({ org_uuid }: { org_uuid: string }) {
  const dispatch = useAppDispatch();

  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const { organizationSettings } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { isUserExist, isExistLoading, isGeneratingCode } = useAppSelector(
    (state) => state.userSlice,
  );

  const isAutoIdMode =
    organizationSettings?.employee_id_pattern?.type === EmployeeIdMode.AUTO;

  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [wantsToChangeImage, setWantsToChangeImage] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const passwordComplexityRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

  const userSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .regex(/^[A-Za-z\s'-]+$/, "Name must contain only alphabets and spaces")
      .max(50, "Name must be 50 characters or fewer"),
    email: z
      .string()
      .trim()
      .nonempty("Email is required")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address")
      .max(50, "Email must be 50 characters or fewer"),
    password: isUserExist
      ? z.string().trim().optional()
      : z
          .string()
          .trim()
          .min(1, "Password is required")
          .max(255, "Password must be 255 characters or fewer")
          .regex(
            passwordComplexityRegex,
            "Password must include uppercase, lowercase, number, and special character",
          ),
    role_uuid: z.string().trim().min(1, "Role is required"),
    image: z.string().trim().optional().nullable(),
    emp_code: z
      .string()
      .trim()
      .min(4, "Code must be at least 4 characters")
      .max(20, "Code must be 20 characters or fewer"),
  });

  type FormData = z.infer<typeof userSchema>;

  const { control, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role_uuid: "",
      image: "",
      emp_code: "",
    },
  });

  const emailValue = watch("email");
  const email = useDebounce(emailValue, 500);

  const resetDialogState = (isOpening: boolean) => {
    setOpen(isOpening);
    setCapturedImage(null);
    setShowCamera(false);
    stopCamera();
    setWantsToChangeImage(false);
    setRemoveExistingImage(false);
    dispatch(setIsUserExist(false));

    if (isOpening) {
      reset({
        name: "",
        email: "",
        password: "",
        role_uuid: "",
        image: "",
        emp_code: "",
      });
      return;
    }

    reset();
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let uploadedImageUrl = "";

      if (capturedImage) {
        const formData = new FormData();

        const [meta, base64Data] = capturedImage.split(",");
        const mimeMatch = /data:(.*);base64/.exec(meta);
        const mimeType = mimeMatch?.[1] || "image/jpeg";
        const fileExtension = mimeType.split("/")[1] || "jpg";

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        formData.append("file", blob, `face_photo.${fileExtension}`);

        const uploadResult: any = await dispatch(fileUploadAction(formData));
        if (uploadResult?.payload?.success) {
          uploadedImageUrl = uploadResult.payload.url;
        } else {
          return;
        }
      }

      let submitSuccess = false;
      const selectedRole = roles.find((role) => role.uuid === data.role_uuid);

      const { password, image, ...rest } = data;

      const createResult = await dispatch(
        createUserAction({
          org_uuid,
          ...rest,
          ...(!isUserExist && { password }),
          ...(uploadedImageUrl && { image: uploadedImageUrl }),
          role:
            selectedRole?.name === "Admin"
              ? PublicRoleEnum.ADMIN
              : PublicRoleEnum.USER,
        }),
      );
      submitSuccess = createUserAction.fulfilled.match(createResult);

      if (!submitSuccess) return;

      dispatch(
        listUserAction({ org_uuid, pagination: { page: 1, limit: 10 } }),
      );
      dispatch(setPagination({ page: 1, limit: 10 }));
      setOpen(false);

      reset();
      setCapturedImage(null);
      setShowCamera(false);
      setWantsToChangeImage(false);
      setRemoveExistingImage(false);
      stopCamera();
      dispatch(setIsUserExist(false));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateEmployeeCode = async () => {
    if (isAutoIdMode) {
      const result = await dispatch(generateEmployeeCodeAction({ org_uuid }));
      setValue("emp_code", result.payload, { shouldValidate: true });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        setRemoveExistingImage(false);
        stopCamera();
        setShowCamera(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowCamera(true);
    startCamera();
  };

  const removePhoto = () => {
    setCapturedImage(null);
  };

  useEffect(() => {
    if (open) {
      dispatch(getOrganizationRolesAction({ org_uuid }));
      dispatch(getOrganizationSettingsAction({ org_uuid }));
    }
  }, [org_uuid, open, dispatch]);

  useEffect(() => {
    if (open) handleGenerateEmployeeCode();
  }, [open, organizationSettings, isAutoIdMode, org_uuid, dispatch]);

  useEffect(() => {
    dispatch(isUserExistAction(email));
  }, [email]);

  useEffect(() => {
    if (showCamera) startCamera();
    return () => {
      stopCamera();
    };
  }, [showCamera]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        resetDialogState(nextOpen);
      }}
    >
      {
        <Button size="sm" onClick={() => resetDialogState(true)}>
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:block">Create User</span>
        </Button>
      }

      <DialogContent className="sm:max-w-175">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle>{"Create User"}</DialogTitle>
            <DialogDescription>
              Add a new team member with their details, role, and shift
              assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 overflow-y-auto no-scrollbar py-2 px-1 max-h-[70vh]">
            {/* Full Name */}
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel
                    htmlFor="user-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="user-name"
                      placeholder="e.g., John Doe"
                      aria-invalid={fieldState.invalid}
                      maxLength={50}
                      {...field}
                    />
                    <InputGroupAddon>
                      <InputGroupText>
                        <User className="w-4 h-4 text-primary" />
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel
                    htmlFor="user-email"
                    className="text-sm font-semibold text-foreground"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="user-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      aria-invalid={fieldState.invalid}
                      maxLength={50}
                      {...field}
                    />
                    <InputGroupAddon>
                      <Mail className="w-4 h-4 text-primary" />
                    </InputGroupAddon>

                    <InputGroupAddon align={"inline-end"}>
                      {isExistLoading && (
                        <>
                          <LoaderCircle className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-xs text-muted-foreground font-medium">
                            Verifying...
                          </span>
                        </>
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                  {isUserExist && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-1">
                      <Dot size={12} strokeWidth={7} />
                      User exists - will be added to organization
                    </p>
                  )}
                </Field>
              )}
            />

            {!isUserExist && (
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel
                      htmlFor="user-password"
                      className="text-sm font-semibold text-foreground"
                    >
                      Password <span className="text-destructive">*</span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="user-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        aria-invalid={fieldState.invalid}
                        maxLength={255}
                        {...field}
                      />
                      <InputGroupAddon>
                        <InputGroupText>
                          <Lock className="w-4 h-4 text-primary" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <InputGroupText
                          className="cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={0}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-primary" />
                          ) : (
                            <Eye className="w-4 h-4 text-primary" />
                          )}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                )}
              />
            )}

            <Controller
              name="emp_code"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel
                    htmlFor="user-emp_code"
                    className="text-sm font-semibold text-foreground"
                  >
                    Employee Code <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="user-emp_code"
                      type="text"
                      placeholder={
                        isAutoIdMode
                          ? "Generating code..."
                          : "Enter employee code"
                      }
                      aria-invalid={fieldState.invalid}
                      maxLength={20}
                      readOnly={isAutoIdMode}
                      className="font-medium"
                      {...field}
                    />
                    <InputGroupAddon>
                      {isAutoIdMode && isGeneratingCode ? (
                        <LoaderCircle className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <ScanQrCode className="w-4 h-4 text-primary" />
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                  {isAutoIdMode && !isGeneratingCode && !field.value && (
                    <p className="text-xs text-destructive">
                      Code generation failed. Please try reopening this dialog.
                    </p>
                  )}
                </Field>
              )}
            />

            {/* Role Selection */}
            <Controller
              name="role_uuid"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel className="text-sm font-semibold text-foreground">
                    Assign Role <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Choose a role for this user" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.uuid} value={role.uuid}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                  {field.value && (
                    <p className="text-xs text-primary bg-primary/5 p-2 rounded-md border border-primary/20">
                      {roles.find((r) => r.uuid === field.value)?.description}
                    </p>
                  )}
                </Field>
              )}
            />

            <CaptureFacePhoto
              videoRef={videoRef}
              isCameraActive={isCameraActive}
              showCamera={showCamera}
              setShowCamera={setShowCamera}
              capturedImage={capturedImage}
              setCapturedImage={setCapturedImage}
              capturePhoto={capturePhoto}
              retakePhoto={retakePhoto}
              removePhoto={removePhoto}
              stopCamera={stopCamera}
              wantsToChangeImage={wantsToChangeImage}
              setWantsToChangeImage={setWantsToChangeImage}
              removeExistingImage={removeExistingImage}
              setRemoveExistingImage={setRemoveExistingImage}
            />

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <DialogFooter className="pt-4 border-t border-border gap-1">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isExistLoading || isSubmitting}
              type="submit"
              size="sm"
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
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
