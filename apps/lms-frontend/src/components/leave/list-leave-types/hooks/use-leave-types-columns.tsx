import { ColumnDef } from "@tanstack/react-table";
import { Clock, Tag } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/haspermissios";
import { getBadge } from "@/utils/get-badge";
import { LeaveType } from "@/features/leave/leave.types";
import { getPolicyMode, getApplicableForLabels } from "@/utils/leave-type";
import { LeaveTypeStatusToggle } from "./components/leave-type-status-toggle";
import { LeaveTypeInfoDialog } from "./components/leave-type-info-dialog";
import { OverflowClipBadges } from "@/shared/overflow-clip-badges";

export const useLeaveTypesColumns = (org_uuid?: string): ColumnDef<LeaveType>[] => {
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);

  const canToggleStatus = hasPermissions(
    "leave_type_management",
    "update",
    currentUserRolePermissions,
    currentUser?.email,
  );

  const statusColumn: ColumnDef<LeaveType> = {
    id: "active_inactive",
    header: () => <div className="text-center w-20"><span>Status</span></div>,
    cell: ({ row }) => (
      <LeaveTypeStatusToggle
        leaveTypeUUID={row.original.uuid}
        isActive={row.original.is_active}
        orgUUID={org_uuid!}
      />
    ),
  };

  return [
    ...(canToggleStatus ? [statusColumn] : []),
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex flex-col">
              <p className="font-semibold leading-tight">{row.getValue("name")}</p>
              <p className="truncate text-xs text-muted-foreground max-w-50">
                {row.original.description}
              </p>
            </div>
          </HoverCardTrigger>
          {row.original.description && (
            <HoverCardContent className="max-w-sm">
              <p className="text-sm" style={{ wordBreak: "break-word" }}>
                {row.original.description}
              </p>
            </HoverCardContent>
          )}
        </HoverCard>
      ),
    },
    {
      id: "info",
      header: "",
      cell: ({ row }) => <LeaveTypeInfoDialog leave={row.original} />,
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => getBadge("default", row.getValue("code"), undefined),
    },
    {
      accessorKey: "accrual",
      header: "Type",
      cell: ({ row }) => {
        const period = (row.getValue("accrual") as LeaveType["accrual"])?.period;
        return getBadge(
          period,
          period?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          <Clock size={10} />,
        );
      },
    },
    {
      accessorKey: "applicable_for",
      header: () => <div className="w-80"><p>Applicable For</p></div>,
      cell: ({ row }) => (
        <OverflowClipBadges labels={getApplicableForLabels(row.original)} />
      ),
    },
    {
      accessorKey: "policy",
      header: "Policy",
      cell: ({ row }) => {
        const policy = getPolicyMode(row.original);
        return getBadge(policy, policy, <Tag size={10} />);
      },
    },
  ];
};