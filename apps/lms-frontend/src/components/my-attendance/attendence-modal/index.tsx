import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.type";
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
}: AttendanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCheckedIn ? "Confirm Clock Out" : "Mark Your Attendance"}
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
          {!attendanceMode ? (
            <div className="flex gap-4">
              {organizationSettings?.attendance_method !==
                OrgAttendanceMethod.MANUAL && (
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
              {organizationSettings?.attendance_method !==
                OrgAttendanceMethod.FACE && (
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
                <label className="text-sm font-medium">
                  Current Time Stamp
                </label>
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
            <Button variant="outline" onClick={() => setAttendanceMode(null)}>
              Back
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
