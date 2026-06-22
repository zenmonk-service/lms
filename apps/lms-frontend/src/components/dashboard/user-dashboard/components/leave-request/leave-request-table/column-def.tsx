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
        return (
          <div className="flex gap-1 flex-wrap">
            {managers.slice(0, 2).map((manager) => (
              <Badge
                variant={"outline"}
                className="rounded-sm"
                key={manager.user_id}
              >
                {manager.name}
              </Badge>
            ))}
            {managers.length > 2 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="cursor-pointer" variant={"outline"}>
                    + {managers.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent align="start" className="max-w-80">
                  <div className="flex flex-wrap gap-1">
                    {managers.slice(2).map((manager, index) => (
                      <span key={manager.user_id} className="text-xs">
                        {manager.name}
                        {index < managers.length - 3 && ", "}
                      </span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
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
