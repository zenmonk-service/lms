"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Scan, X, Save, Edit as EditIcon } from "lucide-react";

interface UserPhotoModalProps {
  readonly isPhotoModalOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly selectedUserImage?: string;
  readonly onConfirmPhoto: (imageFile: File, previewImage: string) => void;
}

export default function UserPhotoModal({
  isPhotoModalOpen,
  onOpenChange,
  selectedUserImage,
  onConfirmPhoto,
}: Readonly<UserPhotoModalProps>) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [wantsToChangeImage, setWantsToChangeImage] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
        setShowCamera(false);
      }
    }
  };

  const removePhoto = () => {
    setCapturedImage(null);
    setShowCamera(false);
    stopCamera();
  };

  const handlePhotoModalClose = () => {
    stopCamera();
    onOpenChange(false);
    setShowCamera(false);
    setCapturedImage(null);
    setWantsToChangeImage(false);
    setRemoveExistingImage(false);
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "captured-photo.jpg", {
            type: "image/jpeg",
          });
          onConfirmPhoto(file, capturedImage);
          handlePhotoModalClose();
        })
        .catch((error) => {
          console.error("Error converting image to file:", error);
        });
    }
  };

  return (
    <Dialog open={isPhotoModalOpen} onOpenChange={handlePhotoModalClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Face Photo</DialogTitle>
          <DialogDescription>
            Capture or upload a photo for facial recognition attendance tracking (Optional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show existing image in edit mode */}
          {selectedUserImage && !wantsToChangeImage && !capturedImage && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-md">
                <img
                  src={selectedUserImage}
                  alt="User face"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                  <Camera size={12} />
                  CURRENT PHOTO
                </div>
              </div>
              <div className="w-full flex items-center justify-between gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
                  onClick={() => setWantsToChangeImage(true)}
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          )}

          {/* Show capture/upload options when creating, changing photo, or no photo exists */}
          {(!selectedUserImage || wantsToChangeImage) && !capturedImage && !showCamera && (
            <div className="space-y-3">
              {wantsToChangeImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setWantsToChangeImage(false);
                    setRemoveExistingImage(false);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel Change
                </Button>
              )}
              {removeExistingImage && !capturedImage && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/30">
                  Current photo will be removed when you save changes.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary h-20 flex-col gap-1"
                  onClick={() => {
                    setShowCamera(true);
                    startCamera();
                  }}
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm font-semibold">Capture Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary h-20 flex-col gap-1"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setCapturedImage(event.target?.result as string);
                          setRemoveExistingImage(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="text-sm font-semibold">Upload Photo</span>
                </Button>
              </div>
            </div>
          )}

          {/* Camera View */}
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

          {/* Captured Image */}
          {capturedImage && (
            <div className="relative rounded-xl overflow-hidden border-2 border-green-500/50 group shadow-md">
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
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

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="outline" onClick={handlePhotoModalClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmPhoto}
            disabled={!capturedImage}
          >
            <Save className="w-4 h-4 mr-2" />
            Use This Photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
