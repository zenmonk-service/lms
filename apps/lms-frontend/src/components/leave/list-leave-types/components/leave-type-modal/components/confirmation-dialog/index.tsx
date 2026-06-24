import { LeaveTypeFormData } from "@/components/leave/leave.types";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  handleConfirm: () => Promise<void>;
  data: Omit<LeaveTypeFormData, "applicable_for"> & { applicable_for: { name: string[] } };
}

const Confirm = ({
  open,
  onOpenChange,
  isLoading,
  handleConfirm,
  data,
}: IProps) => {

  const getPolicyMode = (values: Omit<LeaveTypeFormData, "applicable_for"> & { applicable_for: { name: string[] } }) => {
    if (values.is_sandwich_enabled && values.is_clubbing_enabled) {
      return "Hybrid (Sandwich + Clubbing)";
    }
    if (values.is_sandwich_enabled) return "Sandwich";
    if (values.is_clubbing_enabled) return "Clubbing";
    return "Standard";
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Leave Type Creation"
      description="After creating this leave type, it will be treated as locked and cannot be edited later. Please review the preview before continuing."
      isLoading={isLoading}
      handleConfirm={handleConfirm}
    >
      {data && (
        <div className="mt-3 rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Please verify this configuration carefully. Editing will be
            restricted after creation.
          </div>

          <p className="text-xs font-semibold  text-muted-foreground">
            Leave Type Preview
          </p>

          <div className="mt-3 overflow-hidden rounded-md border alternate-bg">
            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{data.name}</span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Code</span>
              <span className="font-mono font-medium">
                {data.code.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Applicable For</span>
              <div className="flex flex-wrap gap-1.5">
                <p className="font-medium">{data.applicable_for.name.join(', ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Accrual</span>
              <span className="font-medium capitalize">
                {data.period === "no_accrual"
                  ? "no Accrual"
                  : data.period}
              </span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Leave Count</span>
              <span className="font-medium">
                {data.leave_count} days
              </span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Policy Mode</span>
              <span className="font-medium">
                {getPolicyMode(data)}
              </span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Max Consecutive Days
              </span>
              <span className="font-medium">
                {data.showConsecutiveDays
                  ? `${data.max_consecutive_days} days`
                  : "Not limited"}
              </span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Leave Count</span>
              <span className="font-medium">
                {data.leave_count} days
              </span>
            </div>

            <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
              <span className="text-muted-foreground">Carry Forward</span>
              <span className="font-medium">
                {data.carry_forward ? "Allowed" : "Restricted"}
              </span>
            </div>
          </div>
        </div>
      )}
    </ConfirmationDialog>
  );
};

export default Confirm;
