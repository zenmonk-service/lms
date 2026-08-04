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
  onRemarkChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

const RemarkDialog = ({
  open,
  date,
  status,
  remark,
  onRemarkChange,
  onOpenChange,
  onSubmit,
}: IProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          placeholder="Add a remark (optional)"
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemarkDialog;