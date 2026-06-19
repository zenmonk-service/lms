import { LeaveType } from "@/features/leave/leave.types";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

export const getLeaveTypeColumns = (
  leaveTypes: LeaveType[],
  onAdjustLeave: (user: any) => void,
): ColumnDef<any>[] => {
  return [
    {
      accessorKey: "name",
      header: "Employee",
    },

    ...leaveTypes.map((leaveType) => ({
      accessorKey: leaveType.code,
      header: leaveType.name,
      cell: ({ row }: any) => {
        const leaveBalance = row.original[leaveType.code];

        if (!leaveBalance) {
          return (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted">
                Not Allocated
              </span>
            </div>
          );
        }

        const allocated = leaveBalance.leaves_allocated || 0;
        const remaining = parseFloat(leaveBalance.balance) || 0;
        const used = Math.max(0, allocated - remaining);
        const percentage =
          allocated > 0 ? (remaining / allocated) * 100 : 0;

        return (
          <div className="min-w-[155px] space-y-1">
            <div className="flex justify-between items-end text-[11px] font-semibold">
              <span>
                {remaining.toFixed(1)} / {allocated}
              </span>

              <span className="text-xs text-muted-foreground">
                {used.toFixed(1)} used
              </span>
            </div>

            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    })),

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjustLeave(row.original)}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Adjust Leave
        </Button>
      ),
    },
  ];
};