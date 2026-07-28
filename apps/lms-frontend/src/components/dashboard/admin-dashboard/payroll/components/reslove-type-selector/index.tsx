import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleOpen: (type: "attendance_penalty" | "leave_balance_deficit") => void;
}

export function ResolveTypeSelector({ open, onOpenChange, handleOpen }: IProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Resolve Issue</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            What would you like to resolve first? You can only resolve one at a time.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => handleOpen("attendance_penalty")}>
              Attendance Penalty
            </Button>
            <Button variant="outline" onClick={() => handleOpen("leave_balance_deficit")}>
              Leave Balance Deficit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
