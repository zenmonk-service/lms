import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Camera, Scan, Upload, X } from "lucide-react";
import React from "react";

export default function CaptureFacePhoto({
  videoRef,
  isCameraActive,
  showCamera,
  setShowCamera,
  capturedImage,
  setCapturedImage,
  capturePhoto,
  retakePhoto,
  removePhoto,
  stopCamera,
  wantsToChangeImage,
  setWantsToChangeImage,
  removeExistingImage,
  setRemoveExistingImage,
}: {
  videoRef:  React.RefObject<HTMLVideoElement | null>;
  isCameraActive: boolean;
  showCamera: boolean;
  setShowCamera: React.Dispatch<React.SetStateAction<boolean>>;
  capturedImage: string | null;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
  capturePhoto: () => void;
  retakePhoto: () => void;
  removePhoto: () => void;
  stopCamera: () => void;
  wantsToChangeImage: boolean;
  setWantsToChangeImage: React.Dispatch<React.SetStateAction<boolean>>;
  removeExistingImage: boolean;
  setRemoveExistingImage: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Field className="gap-1">
      <FieldLabel className="text-sm font-semibold text-foreground">
        Face Photo{" "}
        <span className="text-muted-foreground text-xs font-normal">
          (Optional)
        </span>
      </FieldLabel>
      <div className="space-y-3">
        {!capturedImage && !showCamera && (
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
                Current photo will be removed when you update this user.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary h-20 flex-col gap-1"
                onClick={() => setShowCamera(true)}
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
              className="w-full  object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
        📸 Capture or upload a face photo for facial recognition attendance
        tracking.
      </p>
    </Field>
  );
}
