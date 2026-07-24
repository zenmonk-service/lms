import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload } from "lucide-react";
import React from "react";

export default function UploadOptionDialog({
  open,
  setOpen,
  isImgLoading,
  uploadInputRef,
  setShowCamera,
  startCamera,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isImgLoading: boolean;
  uploadInputRef: React.RefObject<HTMLInputElement|null>;
  setShowCamera: (open: boolean) => void;
  startCamera: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 pt-2">
          <Button
            variant="outline"
            className="justify-start gap-3 h-12"
            disabled={isImgLoading}
            onClick={() => {
              setOpen(false);
              uploadInputRef.current?.click();
            }}
          >
            <Upload className="h-5 w-5" />
            Upload from Device
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-12"
            disabled={isImgLoading}
            onClick={async () => {
              setOpen(false);
              setShowCamera(true);

              await startCamera();
            }}
          >
            <Camera className="h-5 w-5" />
            Capture from Camera
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
