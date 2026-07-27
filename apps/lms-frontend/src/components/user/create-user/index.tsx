"use client";

import { useEffect, useState, useRef } from "react";
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
  LoaderCircle,
  Eye,
  EyeOff,
  ScanQrCode,
} from "lucide-react";
import { setIsUserExist, setPagination } from "@/features/user/user.slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { isUserExistAction } from "@/features/user/is-user-exist/is-user-exist.action";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { createUserAction } from "@/features/user/create-user/create-user.action";
import { PublicRoleEnum } from "@/features/user/user.type";
import CaptureFacePhoto from "./capture-face";

export default function CreateUser({ org_uuid }: { org_uuid: string }) {
  const dispatch = useAppDispatch();
  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const shifts = useAppSelector((state) => state.shiftSlice.shifts);
  const { isUserExist, isExistLoading } = useAppSelector(
    (state) => state.userSlice,
  );
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
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
    role: z.string().trim().min(1, "Role is required"),
    shift: z.string().trim().min(1, "Shift is required"),
    image: z.string().trim().optional().nullable(),
    emp_code: z
      .string()
      .trim()
      .min(4, "Code must be at least 4 characters")
      .max(20, "Code must be 20 characters or fewer"),
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
  });

  const emailValue = watch("email");
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
        role: "",
        shift: "",
        image: "",
      });
      setSelectedRole("");
      setSelectedShift("");
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

        const uploadResult: any = await dispatch(imageUploadAction(formData));
        if (uploadResult?.payload?.success) {
          uploadedImageUrl = uploadResult.payload.url;
        } else {
          return;
        }
      }

      let submitSuccess = false;

      const selectedRole = roles.find((role) => role.uuid === data.role);

      const createResult = await dispatch(
        createUserAction({
          name: data.name,
          email: data.email?.trim() || "",
          shift_uuid: data.shift,
          // only send password when user is NOT already present
          ...(!isUserExist && { password: data.password ?? "" }),
          org_uuid,
          role_uuid: data.role,
          role:
            selectedRole?.name === "Admin"
              ? PublicRoleEnum.ADMIN
              : PublicRoleEnum.USER,
          emp_code: data.emp_code,
          ...(uploadedImageUrl && { image: uploadedImageUrl }),
        }),
      );
      submitSuccess = createUserAction.fulfilled.match(createResult);

      if (!submitSuccess) return;

      dispatch(
        listUserAction({ org_uuid, pagination: { page: 1, limit: 10 } }),
      );
      dispatch(setPagination({ page: 1, limit: 10 }));
      setOpen(false);

      // Reset form and states
      reset();
      setSelectedRole("");
      setSelectedShift("");
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

  useEffect(() => {
    if (open) {
      dispatch(getOrganizationRolesAction({ org_uuid }));
      dispatch(listOrganizationShiftsAction({ org_uuid }));
    }
  }, [org_uuid, open, dispatch]);

  useEffect(() => {
    const isValidEmail = emailValue;

    if (!isValidEmail) {
      return;
    }

    const handler = setTimeout(() => {
      dispatch(isUserExistAction(emailValue.trim()));
    }, 500);

    return () => clearTimeout(handler);
  }, [emailValue]);

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
    if (showCamera) {
      startCamera();
    }
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
            <Field data-invalid={!!errors.name} className="gap-1">
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
                  aria-invalid={!!errors.name}
                  maxLength={50}
                  {...register("name")}
                />
                <InputGroupAddon>
                  <InputGroupText>
                    <User className="w-4 h-4 text-primary" />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[errors.name]} className="text-xs" />
            </Field>

            <Field data-invalid={!!errors.email} className="gap-1">
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
                  aria-invalid={!!errors.email}
                  maxLength={50}
                  {...register("email")}
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
              <FieldError errors={[errors.email]} className="text-xs" />
              {isUserExist && (
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  User exists - will be added to organization
                </p>
              )}
            </Field>

            {!isUserExist && (
              <Field data-invalid={!!errors.password} className="gap-1">
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
                    aria-invalid={!!errors.password}
                    maxLength={255}
                    {...register("password")}
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

                <FieldError errors={[errors.password]} className="text-xs" />
              </Field>
            )}

            <Field data-invalid={!!errors.emp_code} className="gap-1">
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
                  placeholder="Enter employee code"
                  aria-invalid={!!errors.emp_code}
                  maxLength={20}
                  {...register("emp_code")}
                />
                <InputGroupAddon>
                  <ScanQrCode className="w-4 h-4 text-primary" />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[errors.emp_code]} className="text-xs" />
            </Field>

            {/* Role Selection */}
            <Field data-invalid={!!errors.role} className="gap-1">
              <FieldLabel className="text-sm font-semibold text-foreground">
                Assign Role <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={selectedRole}
                onValueChange={(val) => {
                  setSelectedRole(val);
                  setValue("role", val, { shouldValidate: true });
                  trigger("role");
                }}
              >
                <SelectTrigger className={`w-full ${errors.role}`}>
                  <SelectValue placeholder="Choose a role for this user" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.uuid} value={role.uuid}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.role]} className="text-xs" />
              {selectedRole && (
                <p className="text-xs text-primary bg-primary/5 p-2 rounded-md border border-primary/20">
                  {roles.find((r: any) => r.uuid === selectedRole)?.description}
                </p>
              )}
            </Field>

            <Field data-invalid={!!errors.shift} className="gap-1">
              <FieldLabel className="text-sm font-semibold text-foreground">
                Assign Shift <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={selectedShift}
                onValueChange={(val) => {
                  setSelectedShift(val);
                  setValue("shift", val, { shouldValidate: true });
                  trigger("shift");
                }}
              >
                <SelectTrigger className={`w-full ${errors.shift}`}>
                  <SelectValue placeholder="Choose a work shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift: any) => (
                    <SelectItem key={shift.uuid} value={shift.uuid}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.shift]} className="text-xs" />
            </Field>

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
