import { AttendanceMode } from "@/components/attendance/attendance.types";
import { Button } from "@/components/ui/button";

interface Props {
  isCheckedIn: boolean;
  onSelect: (mode: Exclude<AttendanceMode, null>) => void;
}

export function ModePicker({ isCheckedIn, onSelect }: Props) {
  const action = isCheckedIn ? "Check Out" : "Check In";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        How would you like to {action.toLowerCase()}?
      </p>
      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={() => onSelect("face")}>
          Face Recognition
        </Button>
        <Button variant="outline" onClick={() => onSelect("manual")}>
          Manual
        </Button>
      </div>
    </div>
  );
}