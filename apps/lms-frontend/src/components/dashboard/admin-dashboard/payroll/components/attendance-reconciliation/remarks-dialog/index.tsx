import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/format-date";
import { ATTENDANCE_STATUS_META } from "@/utils/attendance-status";
import { AttendanceStatus } from "@/features/attendances/attendances.type";

interface IProps {
  open: boolean;
  date?: string;
  status?: AttendanceStatus;
  remark: string;
  isLoading?: boolean;
  onRemarkChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

const RemarkDialog = ({
  open,
  date,
  status,
  remark,
  isLoading = false,
  onRemarkChange,
  onOpenChange,
  onSubmit,
}: IProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Block dismissal (overlay click, Escape) while submitting, same as
        // the disabled Cancel button below — closing mid-request would hide
        // the only feedback that it's still in flight.
        if (!isLoading) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a remark</DialogTitle>
          <DialogDescription>
            {date && status
              ? `Marking ${formatDate(date)} as ${ATTENDANCE_STATUS_META[status]?.label}. You can optionally add a remark.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          className="w-full h-50 resize-none border rounded-md p-2"
          placeholder="Add a remark (optional)"
          maxLength={254}
          rows={4}
          disabled={isLoading}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemarkDialog;