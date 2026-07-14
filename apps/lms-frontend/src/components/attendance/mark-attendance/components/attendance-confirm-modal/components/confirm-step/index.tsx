import { useCallback } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FaceDetection from "@/components/attendance/mark-attendance/components/attendance-confirm-modal/components/face-detection";

interface Props {
  isCheckedIn: boolean;
  isFaceFlow: boolean;
  faceVerified: boolean;
  isLoading: boolean;
  onFaceVerified: (value: boolean) => void;
  onConfirm: () => void;
  onBack?: () => void;
}

export function ConfirmStep({
  isCheckedIn,
  isFaceFlow,
  faceVerified,
  isLoading,
  onFaceVerified,
  onConfirm,
  onBack,
}: Props) {
  const action = isCheckedIn ? "Check Out" : "Check In";
  const canConfirm = isFaceFlow ? faceVerified && !isLoading : !isLoading;

  const handleSetVerified = useCallback(
    (v: boolean) => onFaceVerified(v),
    [onFaceVerified],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to {action.toLowerCase()}?
      </p>
      {isFaceFlow && <FaceDetection setVerified={handleSetVerified} />}
      <div className="flex gap-2 justify-end">
        {onBack && (
          <Button variant="ghost" onClick={onBack} disabled={isLoading}>
            Back
          </Button>
        )}
        <Button onClick={onConfirm} disabled={!canConfirm}>
          {isLoading ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            "Confirm"
          )}
        </Button>
      </div>
    </div>
  );
}
