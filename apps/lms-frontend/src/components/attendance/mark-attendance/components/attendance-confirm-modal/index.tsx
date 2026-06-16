import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.types";
import { ModePicker } from "./components/mode-picker";
import { ConfirmStep } from "./components/confirm-step";
import {
  AttendanceMode,
  AttendanceStep,
} from "@/components/attendance/attendance.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCheckedIn: boolean;
  attendanceMethod: OrgAttendanceMethod;
  isLoading: boolean;
  onConfirm: () => void;
}

export function AttendanceConfirmDialog({
  open,
  onOpenChange,
  isCheckedIn,
  attendanceMethod,
  isLoading,
  onConfirm,
}: Props) {
  const isDual = attendanceMethod === OrgAttendanceMethod.DUAL;
  const isFaceOnly = attendanceMethod === OrgAttendanceMethod.FACE;

  const [step, setStep] = useState<AttendanceStep>(
    isDual ? "pick-mode" : "confirm",
  );
  const [mode, setMode] = useState<AttendanceMode>(null);
  const [faceVerified, setFaceVerified] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(isDual ? "pick-mode" : "confirm");
      setMode(null);
      setFaceVerified(false);
    }
  }, [open]);

  const isFaceFlow = isFaceOnly || (isDual && mode === "face");
  const action = isCheckedIn ? "Check Out" : "Check In";

  const handleModeSelect = (selected: Exclude<AttendanceMode, null>) => {
    setMode(selected);
    setStep("confirm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
        </DialogHeader>
        {step === "pick-mode" && (
          <ModePicker isCheckedIn={isCheckedIn} onSelect={handleModeSelect} />
        )}
        {step === "confirm" && (
          <ConfirmStep
            isCheckedIn={isCheckedIn}
            isFaceFlow={isFaceFlow}
            faceVerified={faceVerified}
            isLoading={isLoading}
            onFaceVerified={setFaceVerified}
            onConfirm={onConfirm}
            onBack={isDual ? () => setStep("pick-mode") : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
