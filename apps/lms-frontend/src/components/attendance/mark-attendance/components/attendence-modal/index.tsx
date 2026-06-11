import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.types";
import { AlertCircle, Camera, Keyboard, Loader2 } from "lucide-react";

export type AttendanceMode = "manual" | "camera" | null;

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCheckedIn: boolean;
  currentTime: Date;
  attendanceMode: AttendanceMode;
  setAttendanceMode: (mode: AttendanceMode) => void;
  organizationSettings: any;
  setConfirmModal: (modal: {
    show: "open" | "close" | "confirm";
    id: string | null;
  }) => void;
  handleProcessAttendance: () => void;
  isLoading: boolean;
}

export function AttendanceDialog({
  open,
  onOpenChange,
  isCheckedIn,
  currentTime,
  attendanceMode,
  setAttendanceMode,
  organizationSettings,
  setConfirmModal,
  handleProcessAttendance,
  isLoading,
}: Readonly<AttendanceDialogProps>) {
  const canUseCamera =
    organizationSettings?.attendance_method !== OrgAttendanceMethod.MANUAL;
  const canUseManual =
    organizationSettings?.attendance_method !== OrgAttendanceMethod.FACE;

  useEffect(() => {
    if (!open || attendanceMode) return;

    if (canUseCamera && canUseManual) {
      return;
    }

    if (canUseCamera && !canUseManual) {
      setConfirmModal({ show: "open", id: null });
      setAttendanceMode(null);
      onOpenChange(false);
      return;
    }

    if (!canUseCamera && canUseManual) {
      setAttendanceMode("manual");
    }
  }, [
    open,
    attendanceMode,
    canUseCamera,
    canUseManual,
    onOpenChange,
    setAttendanceMode,
    setConfirmModal,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCheckedIn ? "Confirm Check Out" : "Mark Your Attendance"}
          </DialogTitle>
          <DialogDescription>
            {currentTime.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            •{" "}
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {attendanceMode === null ? (
            <div className="flex gap-4">
              {canUseCamera && (
                <Button
                  variant="outline"
                  className="flex-1 flex-col h-auto py-8"
                  onClick={() => {
                    setConfirmModal({ show: "open", id: null });
                    setAttendanceMode(null);
                    onOpenChange(false);
                  }}
                >
                  <div className="bg-card p-2 rounded-lg">
                    <Camera className="w-8! h-8!" />
                  </div>
                  <span className="mt-2 font-semibold">Camera / AI</span>
                </Button>
              )}
              {canUseManual && (
                <Button
                  variant="outline"
                  className="flex-1 flex-col h-auto py-8"
                  onClick={() => setAttendanceMode("manual")}
                >
                  <div className="bg-card p-2 rounded-lg">
                    <Keyboard className="w-8! h-8!" />
                  </div>
                  <span className="mt-2 font-semibold">Manual Entry</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm">
                  Manual marking is logged and may require approval from your
                  manager if frequent.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Time Stamp</p>
                <div className="w-full p-4 border rounded-lg text-lg font-mono">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {attendanceMode && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (canUseCamera && canUseManual) {
                  setAttendanceMode(null);
                  return;
                } else {
                  setConfirmModal({ show: "close", id: null });
                  onOpenChange(false);
                }
              }}
            >
              {canUseCamera && canUseManual ? "Back" : "Cancel"}
            </Button>
            <Button onClick={handleProcessAttendance} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
