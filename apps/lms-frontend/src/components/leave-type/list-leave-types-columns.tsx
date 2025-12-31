import { ColumnDef } from "@tanstack/react-table";
import { Info, LoaderCircle, Pencil } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useAppDispatch, useAppSelector } from "@/store";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { getSession } from "@/app/auth/get-auth.action";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  activateLeaveTypeAction,
  deactivateLeaveTypeAction,
  getLeaveTypesAction,
} from "@/features/leave-types/leave-types.action";
import { hasPermissions } from "@/libs/haspermissios";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export type LeaveTypes = {
  uuid: string;
  name: string;
  code: string;
  description: string;
  applicable_for: {
    type: "string";
    value: string[];
  };
  max_consecutive_days: number | null;
  allow_negative_leaves: boolean;
  accrual: {
    period: string;
    leave_count: string;
    applicable_on: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const DescriptionCell = ({ value }: { value: string }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <Info className="cursor-pointer" height={20} width={20} />
    </HoverCardTrigger>
    <HoverCardContent align="start" className="w-full max-w-80">
      <div className="flex break-all">
        <p className="text-sm">{value || "No description"}</p>
      </div>
    </HoverCardContent>
  </HoverCard>
);

const renderApplicableFor = (
  applicableFor: LeaveTypes["applicable_for"],
  getRole: (roleUuid: string) => any
) => {
  const roles = applicableFor?.value?.map((roleUuid) => getRole(roleUuid)?.name);
  return (
    <div className="flex gap-1 flex-wrap">
      {roles.slice(0, 3).map((role, index) => (
        <Badge variant={"outline"} className="rounded-sm" key={index}>
          {role}
        </Badge>
      ))}
      {roles.length > 3 && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge
              className="cursor-pointer"
              variant={"outline"}
            >
              + {roles.length - 3}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="max-w-80">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {roles.slice(3).map((role, index) => (
                  <Badge
                    variant="outline"
                    className="text-xs rounded-sm"
                    key={index}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};

export const useLeaveTypesColumns = (
  onEdit?: (leaveType: LeaveTypes) => void,
  org_uuid?: string
): ColumnDef<LeaveTypes>[] => {
  const [session, setSession] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.leaveTypeSlice);
  const { roles } = useAppSelector((state) => state.rolesSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );

  const { currentUser } = useAppSelector((state) => state.userSlice);
  function getRole(roleUuid: string) {
    return roles.find((role: any) => role.uuid === roleUuid);
  }

  async function getUserUuid() {
    const session = await getSession();
    setSession(session);
  }

  useEffect(() => {
    async function fetchUserLeaves() {
      await getUserUuid();
    }
    fetchUserLeaves();
  }, [session?.user?.uuid]);

  return [
    ...(hasPermissions(
      "leave_type_management",
      "update",
      currentUserRolePermissions,
      currentUser?.email
    )
      ? [
          {
            id: "active_inactive",
            header: () => {
              return (
                <div className="text-center">
                  <span>Status</span>
                </div>
              );
            },
            cell: ({ row }: any) => {
              const leaveType = row.original;
              const isActive: boolean = leaveType.is_active;
              const leave_type_uuid = leaveType.uuid;
              return (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Switch
                          checked={isActive}
                          onClick={async () => {
                            if (isActive) {
                              await dispatch(
                                deactivateLeaveTypeAction({
                                  org_uuid,
                                  leave_type_uuid,
                                })
                              );
                            } else {
                              await dispatch(
                                activateLeaveTypeAction({
                                  org_uuid,
                                  leave_type_uuid,
                                })
                              );
                            }
                            await dispatch(
                              getLeaveTypesAction({
                                org_uuid: org_uuid!,
                              })
                            );
                          }}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isActive ? "Active" : "Inactive"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span>{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: "Leave Type Name",
      cell: ({ row }) => <span>{row.getValue("name")}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <DescriptionCell value={row.getValue("description") as string} />
      ),
    },
    {
      accessorKey: "accrual",
      header: "Type",
      cell: ({ row }) => {
        const accrual = row.getValue("accrual") as LeaveTypes["accrual"];
        return (
          <Badge
            variant={"outline"}
            className={`rounded-sm ${
              accrual?.period === "monthly"
                ? "text-orange-500 border border-orange-500 font-semibold"
                : ""
            } ${
              accrual?.period === "yearly"
                ? "text-orange-700 border border-orange-700 font-semibold"
                : ""
            }`}
          >
            {accrual?.period.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "applicable_for",
      header: "Applicable For",
      cell: ({ row }) => {
        const applicableFor = row.getValue(
          "applicable_for"
        ) as LeaveTypes["applicable_for"];
        return renderApplicableFor(applicableFor, getRole);
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const dateStr = row.getValue("created_at") as string;
        const date = new Date(dateStr);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    ...(hasPermissions(
      "leave_type_management",
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
              return (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(row.original)}
                      >
                        {isLoading ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <Pencil height={16} width={16} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Leave Type</TooltipContent>
                  </Tooltip>
                </div>
              );
            },
          },
        ]
      : []),
  ];
};
