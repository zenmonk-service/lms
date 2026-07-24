import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function ProfileImagePreviewDialog({
  previewModalOpen,
  capturedImage,
  isImgLoading,
  cancelCapturedPhoto,
  retakePhoto,
  uploadCapturedPhoto,
}: {
  previewModalOpen: boolean;
  capturedImage: string | null;
  isImgLoading: boolean;
  cancelCapturedPhoto: () => void;
  retakePhoto: () => void;
  uploadCapturedPhoto: () => void;
}) {
  return (
    <Dialog
      open={previewModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          cancelCapturedPhoto();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview Profile Photo</DialogTitle>
        </DialogHeader>

        {capturedImage && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <Image
                src={capturedImage}
                alt="Captured"
                width={288}
                height={288}
                className="h-72 w-72 rounded-full object-cover border"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelCapturedPhoto}>
                Cancel
              </Button>

              <Button variant="outline" onClick={retakePhoto}>
                Retake
              </Button>

              <Button disabled={isImgLoading} onClick={uploadCapturedPhoto}>
                {isImgLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
