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
  EditIcon,
  Loader2,
  Eye,
  EyeOff,
  Camera,
  X,
  Upload,
  Scan,
} from "lucide-react";
import {
  setIsUserExist,
  setPagination,
  UserInterface,
} from "@/features/user/user.slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import {
  imageUploadAction,
  isUserExistAction,
  listUserAction,
  updateUserAction,
} from "@/features/user/user.action";
import { createUserAction } from "@/features/organizations/organizations.action";
import { listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { set } from "date-fns";

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
  const shifts = useAppSelector((state) => state.shiftSlice.shifts);
  const { isUserExist, isExistLoading, isLoading } = useAppSelector(
    (state) => state.userSlice
  );

  const [selectedRole, setSelectedRole] = useState(
    isEdited ? (userData ? userData.role.uuid : "") : ""
  );

  const [selectedShift, setSelectedShift] = useState(  isEdited ? (userData ? userData.organization_shift.uuid : "") : "");
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const userSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: isEdited
      ? z.string().trim().optional()
      : z
          .string()
          .trim()
          .nonempty("Email is required")
          .email("Enter a valid email address"),
    password:
      isUserExist || isEdited
        ? z.string().trim().optional()
        : z.string().trim().min(1, "Password is required"),
    role: z.string().trim().min(1, "Role is required"),
    shift: z.string().trim().min(1, "Shift is required"),
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
      shift: isEdited && userData ? userData.organization_shift.uuid : "",
    },
  });
  console.log('✌️userData --->', userData);

  const emailValue = watch("email");

  // ...existing code...

  const onSubmit = async (data: FormData) => {


    if (isEdited && userData) {
      await dispatch(
        updateUserAction({
          name: data.name,
          role: data.role,
          user_uuid: userData.user_id,
          org_uuid: org_uuid,
          shift_uuid: data.shift,
        })
      );
      dispatch(
        listUserAction({ org_uuid, pagination: { page: 1, limit: 10 } })
      );
      dispatch(setPagination({ page: 1, limit: 10 }));
      setOpen(false);
    } else {
      // Create FormData object for multipart/form-data
      const formData = new FormData();

      // Convert base64 image to Blob and add to FormData
      if (capturedImage) {
        // Extract base64 data (remove data:image/jpeg;base64, prefix)
        const base64Data = capturedImage.split(",")[1];

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });

        // Add blob to FormData with filename
        formData.append("file", blob, "face_photo.jpg");
      }

      const res = await dispatch(imageUploadAction(formData));

      await dispatch(
        createUserAction({
          name: data.name,
          email: data.email?.trim() || "",
          shift_uuid: data.shift,
          // only send password when user is NOT already present
          ...(!isUserExist && { password: data.password ?? "" }),
          org_uuid,
          role_uuid: data.role,
          role: "user",
          ...(capturedImage &&
            res.payload.success && { image: res.payload.url }),
        })
      );

      dispatch(
        listUserAction({ org_uuid, pagination: { page: 1, limit: 10 } })
      );
      dispatch(setPagination({ page: 1, limit: 10 }));
      setOpen(false);
    }

    // Reset form and states
    reset();
    setSelectedRole("");
    setSelectedShift("");
    setCapturedImage(null);
    setShowCamera(false);
    stopCamera();
    dispatch(setIsUserExist(false));
  };

  useEffect(() => {
    if (open) {
      dispatch(getOrganizationRolesAction({ org_uuid }));
      dispatch(listOrganizationShiftsAction({ org_uuid }));
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

  // Camera functions
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
      onOpenChange={() => {
        setOpen(!open);
        reset();
        setCapturedImage(null);
        setShowCamera(false);
        stopCamera();
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

            <Field data-invalid={!!errors.shift} className="gap-1">
              <FieldLabel>Assign Shift</FieldLabel>
              <Select
                value={selectedShift}
                onValueChange={(val) => {
                  setSelectedShift(val);
                  setValue("shift", val, { shouldValidate: true });
                  trigger("shift");
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
                  {shifts.map((shift: any) => (
                    <SelectItem key={shift.uuid} value={shift.uuid}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shift && (
                <FieldError errors={[errors.shift]} className="text-xs" />
              )}
             
            </Field> 


            {/* Face Photo Capture */}
            {!isEdited && (
              <Field className="gap-1">
                <FieldLabel>Face Photo (Optional)</FieldLabel>
                <div className="space-y-3">
                  {!capturedImage && !showCamera && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-600"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e: any) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setCapturedImage(
                                  event.target?.result as string
                                );
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                  )}

                  {showCamera && (
                    <div className="relative rounded-2xl overflow-hidden border-4 border-orange-200 bg-slate-900">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-video object-cover"
                      />
                      {isCameraActive && (
                        <>
                          <div className="absolute inset-x-8 top-1/2 h-0.5 bg-orange-500 shadow-[0_0_15px_#FF6B00] animate-pulse" />
                          <div className="absolute top-4 right-4 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <Scan size={12} className="animate-pulse" />
                            CAMERA ACTIVE
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => {
                            setShowCamera(false);
                            stopCamera();
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={capturePhoto}
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Capture
                        </Button>
                      </div>
                    </div>
                  )}

                  {capturedImage && (
                    <div className="relative rounded-2xl overflow-hidden border-4 border-orange-200 group">
                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white"
                          onClick={retakePhoto}
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Retake
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removePhoto}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <Scan size={12} />
                        FACE CAPTURED
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Capture or upload a face photo for facial recognition
                  attendance.
                </p>
              </Field>
            )}

            {/* Hidden canvas for capturing photos */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
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
