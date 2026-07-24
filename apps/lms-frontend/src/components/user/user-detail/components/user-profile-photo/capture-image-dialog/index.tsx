import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

export default function CaptureImageDialog({
  showCamera,
  setShowCamera,
  stopCamera,
  isCameraActive,
  capturePhoto,
  videoRef,
  canvasRef,
}: {
  showCamera: boolean;
  setShowCamera: (open: boolean) => void;
  stopCamera: () => void;
  isCameraActive: boolean;
  capturePhoto: () => void;
  videoRef: React.RefObject<HTMLVideoElement|null>;
  canvasRef: React.RefObject<HTMLCanvasElement|null>;
}) {
  return (
    <Dialog
      open={showCamera}
      onOpenChange={(open) => {
        if (!open) {
          stopCamera();
        }

        setShowCamera(open);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Capture Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="aspect-square h-90 w-160 object-cover"
            />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                stopCamera();
                setShowCamera(false);
              }}
            >
              Cancel
            </Button>

            <Button onClick={capturePhoto} disabled={!isCameraActive}>
              Capture
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
