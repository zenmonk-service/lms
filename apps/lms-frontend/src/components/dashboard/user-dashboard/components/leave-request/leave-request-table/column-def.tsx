import { ColumnDef } from "@tanstack/react-table";
import { LeaveRequest } from "@/features/leave/leave.types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBadge } from "@/utils/get-badge";
import { Minus } from "lucide-react";
import { OverflowClipBadges } from "@/shared/overflow-clip-badges";

export const useLeaveRequestsColumns = (): ColumnDef<
  LeaveRequest["rows"][0]
>[] => {
  return [
    {
      accessorKey: "leave_type_name",
      header: () => <p className="pl-8">Leave Type</p>,
      cell: ({ row }) => <p className="font-medium pl-8">{row.original.leave_type.name}</p>,
    },
    {
      accessorKey: "duration",
      header: "Dates (from - to)",
      cell: ({ row }) => (
        <p>
          <span className="font-medium">{row.original.start_date}</span>
          <Minus className="inline size-3 text-muted-foreground" />
          <span className="font-medium">{row.original.end_date}</span>
        </p>
      ),
    },
    {
      accessorKey: "effective_days",
      header: "Effective Days",
      cell: ({ row }) => <p>{row.original.effective_days ?? "--"}</p>,
    },
    {
      accessorKey: "managers",
      header: "Managers",
      cell: ({ row }) => {
        const managers = row.original.managers.map((manager) => manager.user);
        return <OverflowClipBadges labels={managers.map((m) => m.name)} />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div>{getBadge(row.original.status, row.original.status)}</div>
      ),
    },
  ];
};
