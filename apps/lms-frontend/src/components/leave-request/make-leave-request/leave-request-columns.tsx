import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircleIcon,
  CheckIcon,
  ClockIcon,
  Info,
  LoaderCircle,
  NotepadText,
  Pencil,
  Trash2,
  XIcon,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { Badge } from "../../ui/badge";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { Button } from "../../ui/button";
import { useAppSelector } from "@/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { hasPermissions } from "@/libs/haspermissios";

export interface LeaveRequestStatusChangedBy {
  user_id: string;
  name: string;
  email: string;
}

interface LeaveRequest {
  uuid: string;
  start_date: string;
  end_date: string;
  type: string;
  range: string;
  leave_duration: string;
  reason: string;
  status: LeaveRequestStatus;
  leave_type: {
    name: string;
    uuid: string;
  };
  managers: {
    remarks: string | null;
    user: {
      user_id: string;
      name: string;
      email: string;
    };
  }[];
  status_changed_by: LeaveRequestStatusChangedBy[] | null;
}

const RemarkCell = ({ value }: { value: string }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <NotepadText className="cursor-pointer" height={20} width={20} />
    </HoverCardTrigger>
    <HoverCardContent align="center" className="w-full max-w-80">
      <div className="flex break-all">
        <p className="text-sm">{value}</p>
      </div>
    </HoverCardContent>
  </HoverCard>
);

interface LeaveRequestProps {
  onEdit?: (row: LeaveRequest) => void;
  onDelete?: (uuid: string) => void;
}

export const useLeaveRequestColumns = ({
  onEdit,
  onDelete,
}: LeaveRequestProps): ColumnDef<LeaveRequest>[] => {
  const { isLoading } = useAppSelector((state) => state.leaveRequestSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);

  return [
    {
      accessorKey: "leave_type",
      header: "Leave Type",
      cell: ({ row }) => {
        const leave_type = row.getValue(
          "leave_type"
        ) as LeaveRequest["leave_type"];
        return <span>{leave_type.name}</span>;
      },
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => <span>{row.getValue("start_date")}</span>,
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => <span>{row.getValue("end_date")}</span>,
    },
    {
      accessorKey: "type",
      header: () => {
        return (
          <div className="text-center">
            <span>Type</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex justify-center">
            <Badge variant={"outline"} className="rounded-sm">
              {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "range",
      header: () => {
        return (
          <div className="text-center">
            <span>Range</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const range = row.getValue("range") as string;
        return (
          <div className="flex justify-center">
            <Badge variant={"outline"} className="rounded-sm">
              {range
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <div className="text-center">
            <span>Status</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("status") as LeaveRequestStatus;
        const status_changed_by = row.original.status_changed_by;
        let variant:
          | "default"
          | "destructive"
          | "secondary"
          | "outline"
          | "success";
        switch (value) {
          case LeaveRequestStatus.APPROVED:
            variant = "success";
            break;
          case LeaveRequestStatus.REJECTED:
            variant = "destructive";
            break;
          case LeaveRequestStatus.PENDING:
            variant = "secondary";
            break;
          case LeaveRequestStatus.CANCELLED:
            variant = "outline";
            break;
          case LeaveRequestStatus.RECOMMENDED:
            return (
              <div className="flex justify-center">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="cursor-pointer" height={20} width={20} />
                  </HoverCardTrigger>
                  <HoverCardContent align="center" className="w-full max-w-80">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-start mb-2">
                        Recommended by
                      </p>
                      {status_changed_by && status_changed_by.length > 0 ? (
                        status_changed_by.map((user, index) => (
                          <Badge
                            variant="outline"
                            className="text-xs rounded-sm"
                            key={index}
                          >
                            {user.name.slice(0, 1).toUpperCase() + user.name.slice(1)}
                            {" "}
                            <span className="text-xs opacity-70 italic">({user.email})</span>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm">No recommenders found.</p>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          default:
            variant = "outline";
        }
        return (
          <div className="flex justify-center">
            <Badge variant={variant} className="rounded-sm">
              {variant === "secondary" && <ClockIcon />}
              {variant === "destructive" && <XIcon />}
              {variant === "success" && <CheckIcon />}
              {variant === "outline" && <AlertCircleIcon />}
              {value}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "managers",
      header: "Manager",
      cell: ({ row }) => {
        const managers = row.getValue("managers") as LeaveRequest["managers"];
        const user = managers.map((manager) => manager.user.name);
        return (
          <div className="flex gap-1 flex-wrap">
            {user.slice(0, 3).map((user, index) => (
              <Badge variant={"outline"} className="rounded-sm" key={index}>
                {user}
              </Badge>
            ))}
            {user.length > 3 && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge className="cursor-pointer" variant={"outline"}>
                    + {user.length - 3}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent align="start" className="max-w-80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {user.slice(3).map((user, index) => (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          key={index}
                        >
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "managers.remarks",
      header: "Remark",
      cell: ({ row }) => {
        const managers = row.getValue("managers") as LeaveRequest["managers"];
        const remark = managers.find((manager) => manager.remarks);
        return remark?.remarks ? (
          <RemarkCell value={remark.remarks} />
        ) : (
          <span>-</span>
        );
      },
    },
    ...(hasPermissions(
      "leave_request_management",
      "update",
      currentUserRolePermissions,
      currentUser?.email
    )
      ? [
          {
            accessorKey: "actions",
            id: "actions",
            header: () => {
              return (
                <div className="text-center">
                  <span>Actions</span>
                </div>
              );
            },
            cell: ({ row }: any) => {
              const status = row.getValue("status") as LeaveRequestStatus;
              const uuid = row.original.uuid;

              return (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={status !== LeaveRequestStatus.PENDING}
                        onClick={() => onEdit?.(row.original)}
                      >
                        {isLoading ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <Pencil height={16} width={16} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Leave Request</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={status !== LeaveRequestStatus.PENDING}
                        onClick={() => onDelete?.(uuid)}
                      >
                        {isLoading ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <Trash2
                            height={16}
                            width={16}
                            className="text-orange-500"
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Leave Request</TooltipContent>
                  </Tooltip>
                </div>
              );
            },
          },
        ]
      : []),
  ];
};
