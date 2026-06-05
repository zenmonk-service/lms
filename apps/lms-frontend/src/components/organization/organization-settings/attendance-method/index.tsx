import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.type";
import { ScanFace } from "lucide-react";
import { Control, Controller } from "react-hook-form";

interface AttendanceMethodProps {
  control: Control<any>;
}

const AttendanceMethod = ({ control }: AttendanceMethodProps) => {
  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-card rounded-4xl gap-6">
        <div className="flex-1 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-card-foreground flex items-center justify-center text-card shadow-sm">
            <ScanFace size={20} />
          </div>
          <div>
            <p className="text-sm font-bold ">
              Attendance Method
            </p>
            <p className="text-xs text-muted-foreground">
              Define how members authenticate their presence.
            </p>
          </div>
        </div>

        <Controller
          name="attendance_method"
          control={control}
          render={({ field }) => (
            <RadioGroup
              className="flex-1 flex flex-wrap bg-background rounded-2xl p-1 w-full sm:w-auto"
              value={field.value}
              onValueChange={field.onChange}
            >
              {Object.entries(OrgAttendanceMethod).map(([key, value]) => (
                <label
                  key={`attendance-${key}`}
                  className="relative flex-1 flex flex-col items-center rounded-lg border-0 sm:px-6 py-2 text-center shadow-none transition-all outline-none cursor-pointer hover:bg-accent  has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground"
                >
                  <RadioGroupItem
                    id={`attendance-${key}`}
                    value={value}
                    className="sr-only"
                    aria-label={`size-radio-${value}`}
                  />
                  <p className="text-[10px] leading-none font-bold uppercase tracking-widest py-1">
                    {key}
                  </p>
                </label>
              ))}
            </RadioGroup>
          )}
        />
      </div>
    </div>
  );
};

export default AttendanceMethod;
