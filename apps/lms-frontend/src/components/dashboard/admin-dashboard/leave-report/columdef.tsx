import { LeaveType } from "@/features/leave/leave.types";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getLeaveTypeColumns = (
  leaveTypes: LeaveType[],
  onAdjustLeave: (user: Record<string, any>) => void,
): ColumnDef<Record<string, any>>[] => {
  return [
    {
      accessorKey: "name",

      header: () => (
        <div className="text-center font-semibold">Employee Name</div>
      ),

      cell: ({ row }) => {
        const employee = row.original;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee?.image as string} alt={employee?.name} />

              <AvatarFallback>
                {employee?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="font-medium">{employee?.name}</span>

              <span className="text-xs text-muted-foreground">
                {employee?.email}
              </span>
            </div>
          </div>
        );
      },
    },

    ...leaveTypes.map((leaveType) => ({
      accessorKey: leaveType.code,
      header: () => (
        <div className="text-center font-semibold">{leaveType.name}</div>
      ),
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
        const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-[155px] space-y-1 cursor-help">
                  <div className="flex justify-between items-end text-[11px] font-semibold">
                    <span>
                      {remaining.toFixed(1)} / {allocated}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {used.toFixed(1)} used
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                align="center"
                className="min-w-[240px] border-border bg-popover text-popover-foreground shadow-lg"
              >
                <div className="space-y-3">
                  <div className="border-b border-border pb-2">
                    <p className="font-semibold">{leaveType.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Leave Details
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <span className="text-muted-foreground">Allocated</span>
                    <span className="text-right font-medium">
                      {leaveBalance.leaves_allocated}
                    </span>

                    <span className="text-muted-foreground">Used</span>
                    <span className="text-right font-medium">
                      {used.toFixed(2)}
                    </span>

                    <span className="text-muted-foreground">
                      Current Balance
                    </span>
                    <span className="text-right font-medium">
                      {Number(leaveBalance.balance).toFixed(2)}
                    </span>

                    <span className="text-muted-foreground">SLA Credit</span>
                    <span className="text-right font-medium">
                      {leaveBalance.sla ?? "-"}
                    </span>

                    <span className="text-muted-foreground">Final Balance</span>
                    <span className="text-right font-medium">
                      {leaveBalance.final_balance ??
                        Number(leaveBalance.balance).toFixed(2)}
                    </span>

                    <span className="text-muted-foreground">Period</span>
                    <span className="text-right font-medium">
                      {leaveBalance.period}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    })),

    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdjustLeave(row.original)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Adjust Leave
          </Button>
        </div>
      ),
      size: 160,
    },
  ];
};
