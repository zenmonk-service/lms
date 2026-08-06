"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ImageIcon, Loader2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import { updateUserAction } from "@/features/user/update-user/update-user.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";
import { setCurrentUser } from "@/features/user/user.slice";
import { getInitials } from "@/utils/get-initials";
import ProfileImagePreviewDialog from "./profile-image-preview-dialog";
import CaptureImageDialog from "./capture-image-dialog";
import UploadOptionDialog from "./update-profile-photo-option-dialog";
import { toastError } from "@/shared/toast/toast-error";

interface IProps {
  organizationUuid: string;
  userUuid: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
  button: React.ReactNode;
}

export default function UserProfilePhoto({
  organizationUuid,
  userUuid,
  userName,
  userEmail,
  userRole,
  isActive,
  button
}: IProps) {
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const { currentUser, selectedUser } = useAppSelector((state) => state.userSlice);
  const { isLoading: isImgLoading } = useAppSelector((state) => state.fileSlice);

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [open, setOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",

          width: {
            ideal: 1280,
          },

          height: {
            ideal: 720,
          },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error(error);

      toastError("Unable to access camera.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const uploadProfileImage = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    const uploadResult = await dispatch(fileUploadAction(formData)).unwrap();

    if (!uploadResult.success || !uploadResult.url) {
      toastError("Image upload failed");
    }

    const imageUrl = uploadResult.url;

    await dispatch(
      updateUserAction({
        user_uuid: userUuid,
        org_uuid: organizationUuid,
        image: imageUrl,
      }),
    ).unwrap();

    await dispatch(
      getOrganizationUserAction({
        org_uuid: organizationUuid,
        user_uuid: userUuid,
      }),
    ).unwrap();

    if (currentUser?.user_id === userUuid) {
      dispatch(
        setCurrentUser({
          ...currentUser,
          image: imageUrl,
        }),
      );

      await update({
        image: imageUrl,
      });
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await uploadProfileImage(file);
    } catch (err) {
      toastError("Failed to upload profile image.");
      console.error(err);
    } finally {
      event.target.value = "";
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `profile-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setCapturedFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        setPreviewModalOpen(true);
        stopCamera();
        setShowCamera(false);
      },
      "image/jpeg",
      0.95,
    );
  };

  const uploadCapturedPhoto = async () => {
    if (!capturedFile) return;

    try {
      setPreviewModalOpen(false);
      await uploadProfileImage(capturedFile);
      URL.revokeObjectURL(capturedImage!);
      setCapturedImage(null);
      setCapturedFile(null);
    } catch (err) {
      toastError("Failed to upload captured photo.");
      console.error(err);
    }
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }

    setCapturedImage(null);
    setCapturedFile(null);

    setShowCamera(true);

    startCamera();
  };

  const cancelCapturedPhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }

    setCapturedImage(null);
    setCapturedFile(null);
    setPreviewModalOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();

      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="relative cursor-pointer"
        onClick={() => setOpen(true)}
        disabled={isImgLoading}
      >
        <Avatar className="h-16 w-16 group border border-border">
          <AvatarImage
            src={selectedUser?.image || ""}
            alt={userName}
            className="object-cover"
          />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <ImageIcon className="text-white" size={16} />
          </div>
          {isImgLoading && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Loader2Icon className="text-white animate-spin" size={16} />
            </div>
          )}
        </Avatar>
      </button>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{userName}</h2>
          {button}
        </div>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="rounded-sm">
            Emp code: {selectedUser?.emp_code || "N/A"}
          </Badge>
          <Badge variant="secondary">{userRole}</Badge>
          <Badge variant={isActive ? "success" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <UploadOptionDialog
        open={open}
        setOpen={setOpen}
        isImgLoading={isImgLoading}
        uploadInputRef={uploadInputRef}
        setShowCamera={setShowCamera}
        startCamera={startCamera}
      />

      <CaptureImageDialog
        showCamera={showCamera}
        setShowCamera={setShowCamera}
        stopCamera={stopCamera}
        isCameraActive={isCameraActive}
        capturePhoto={capturePhoto}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />

      <ProfileImagePreviewDialog
        previewModalOpen={previewModalOpen}
        capturedImage={capturedImage}
        isImgLoading={isImgLoading}
        cancelCapturedPhoto={cancelCapturedPhoto}
        retakePhoto={retakePhoto}
        uploadCapturedPhoto={uploadCapturedPhoto}
      />
    </div>
  );
}
