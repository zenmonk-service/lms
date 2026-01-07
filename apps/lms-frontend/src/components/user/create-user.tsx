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
  isUserExistAction,
  listUserAction,
  updateUserAction,
} from "@/features/user/user.action";
import { createUserAction } from "@/features/organizations/organizations.action";
import { listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";

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
  const [selectedImage, setSelectedImage] = useState(  isEdited ? (userData ? userData.image : "") : "");
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [wantsToChangeImage, setWantsToChangeImage] = useState(false);
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
    image : z.string().trim().optional(),
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
      image : isEdited && userData ? userData.image : "",
    },
  });
  console.log('✌️userData --->', userData);

  const emailValue = watch("email");

  // ...existing code...

  const onSubmit = async (data: FormData) => {
    // Handle image upload if a new image was captured
    let uploadedImageUrl = "";
    
    if (capturedImage) {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      
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
      
      // Upload image
      const res = await dispatch(imageUploadAction(formData));
      if (res?.payload?.success) {
        uploadedImageUrl = res.payload.url;
      }
    }

    if (isEdited && userData) {
      console.log('✌️uploadedImageUrl --->', uploadedImageUrl);
      await dispatch(
        updateUserAction({
          name: data.name,
          role: data.role,
          user_uuid: userData.user_id,
          org_uuid: org_uuid,
          shift_uuid: data.shift,
          ...(uploadedImageUrl && { image: uploadedImageUrl }),
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
          shift_uuid: data.shift,
          // only send password when user is NOT already present
          ...(!isUserExist && { password: data.password ?? "" }),
          org_uuid,
          role_uuid: data.role,
          role: "user",
          ...(uploadedImageUrl && { image: uploadedImageUrl }),
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
    setWantsToChangeImage(false);
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
        setWantsToChangeImage(false);
        dispatch(setIsUserExist(false));
      }}
    >
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        {isEdited ? (
          <>
            <EditIcon className="w-4 h-4" /> Edit User
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" /> Create User
          </>
        )}
      </Button>

      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isEdited ? (
                <>
                  <EditIcon className="w-6 h-6 text-primary" />
                  Edit User
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6 text-primary" />
                  Create User
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base">
              {isEdited
                ? "Update user information and manage their role and shift assignments."
                : "Add a new team member with their details, role, and shift assignment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-y-auto no-scrollbar py-6 px-1 max-h-[60vh]">
            {/* Full Name */}
            <Field data-invalid={!!errors.name} className="gap-2">
              <FieldLabel htmlFor="user-name" className="text-sm font-semibold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="user-name"
                  placeholder="e.g., John Doe"
                  aria-invalid={!!errors.name}
                  className="h-11"
                  {...register("name")}
                />
                <InputGroupAddon>
                  <InputGroupText>
                    <User className="w-4 h-4 text-primary" />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.name && (
                <FieldError errors={[errors.name]} className="text-xs" />
              )}
            </Field>
            {/* Email (only when creating and not editing) */}
            {!isEdited && (
              <Field data-invalid={!!errors.email} className="gap-2">
                <FieldLabel htmlFor="user-email" className="text-sm font-semibold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="user-email"
                    type="email"
                    placeholder="john.doe@company.com"
                    aria-invalid={!!errors.email}
                    className="h-11"
                    {...register("email")}
                  />
                  <InputGroupAddon>
                    <InputGroupText className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                    </InputGroupText>
                  </InputGroupAddon>

                  <InputGroupAddon align={"inline-end"}>
                    <InputGroupText className="flex items-center gap-2">
                      {isExistLoading && (
                        <>
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-xs text-muted-foreground font-medium">
                            Verifying...
                          </span>
                        </>
                      )}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {errors.email && (
                  <FieldError errors={[errors.email]} className="text-xs" />
                )}
                {isUserExist && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    User exists - will be added to organization
                  </p>
                )}
              </Field>
            )}
            {/* Password (only when creating and user is not present) */}
            {!isEdited && !isUserExist && (
              <Field data-invalid={!!errors.password} className="gap-2">
                <FieldLabel htmlFor="user-password" className="text-sm font-semibold text-foreground">
                  Password <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    aria-invalid={!!errors.password}
                    className="h-11"
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

                {errors.password && (
                  <FieldError errors={[errors.password]} className="text-xs" />
                )}
              </Field>
            )}
            {/* Role Selection */}
            <Field data-invalid={!!errors.role} className="gap-2">
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
                <SelectTrigger
                  className={
                    errors.role
                      ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive h-11"
                      : "h-11"
                  }
                >
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
              {errors.role && (
                <FieldError errors={[errors.role]} className="text-xs" />
              )}
              {selectedRole && (
                <p className="text-xs text-primary bg-primary/5 p-2 rounded-md border border-primary/20">
                  {roles.find((r: any) => r.uuid === selectedRole)?.description}
                </p>
              )}
            </Field>

            <Field data-invalid={!!errors.shift} className="gap-2">
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
                <SelectTrigger
                  className={
                    errors.shift
                      ? "border-destructive ring-destructive focus-visible:ring-destructive text-destructive h-11"
                      : "h-11"
                  }
                >
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
              {errors.shift && (
                <FieldError errors={[errors.shift]} className="text-xs" />
              )}
             
            </Field> 


            {/* Face Photo Capture */}
            { (
              <Field className="gap-2">
                <FieldLabel className="text-sm font-semibold text-foreground">
                  Face Photo <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                </FieldLabel>
                <div className="space-y-3">
                  {/* Show existing image in edit mode */}
                  {isEdited && userData?.image && !wantsToChangeImage && !capturedImage && (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-md">
                        <img
                          src={userData.image}
                          alt="User face"
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                          <User size={12} />
                          CURRENT PHOTO
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
                        onClick={() => setWantsToChangeImage(true)}
                      >
                        <EditIcon className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  )}

                  {/* Show capture/upload options when creating new user or user wants to change image */}
                  {(!isEdited || wantsToChangeImage) && !capturedImage && !showCamera && (
                    <div className="space-y-3">
                      {wantsToChangeImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setWantsToChangeImage(false)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel Change
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary h-20 flex-col gap-2"
                          onClick={() => setShowCamera(true)}
                        >
                          <Camera className="w-5 h-5" />
                          <span className="text-sm font-semibold">Capture Photo</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-2 hover:border-accent hover:bg-accent/5 h-20 flex-col gap-2"
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
                    </div>
                  )}

                  {showCamera && (
                    <div className="relative rounded-xl overflow-hidden border-2 border-primary bg-black shadow-xl">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-video object-cover"
                      />
                      {isCameraActive && (
                        <>
                          <div className="absolute inset-x-8 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))] animate-pulse" />
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                            <Scan size={12} className="animate-pulse" />
                            CAMERA ACTIVE
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-background/90 hover:bg-background shadow-lg"
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
                          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                          onClick={capturePhoto}
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Capture
                        </Button>
                      </div>
                    </div>
                  )}

                  {capturedImage && (
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-500/50 group shadow-md">
                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-background/90 hover:bg-background shadow-lg"
                          onClick={retakePhoto}
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Retake
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="shadow-lg"
                          onClick={removePhoto}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                        <Scan size={12} />
                        FACE CAPTURED
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-md border border-border">
                  📸 Capture or upload a face photo for facial recognition attendance tracking.
                </p>
              </Field>
            )}

            {/* Hidden canvas for capturing photos */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <DialogFooter className="pt-4 border-t border-border gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="lg" className="min-w-24">Cancel</Button>
            </DialogClose>
            <Button
              disabled={isExistLoading || isLoading}
              type="submit"
              size="lg"
              className="min-w-32 gap-2"
            >
              {isExistLoading || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdited ? "Updating..." : "Creating..."}
                </>
              ) : isEdited ? (
                <>
                  <EditIcon className="h-4 w-4" />
                  Update User
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
