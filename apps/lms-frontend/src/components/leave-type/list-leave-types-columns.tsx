import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Clock, LoaderCircle, Pencil, Tag } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useAppDispatch, useAppSelector } from "@/store";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { getSession } from "@/app/auth/get-auth.action";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  activateLeaveTypeAction,
  deactivateLeaveTypeAction,
  getLeaveTypesAction,
} from "@/features/leave-types/leave-types.action";
import { hasPermissions } from "@/lib/haspermissios";

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
  is_sandwich_enabled: boolean;
  is_clubbing_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const renderApplicableFor = (
  applicableFor: LeaveTypes["applicable_for"],
  getRole: (roleUuid: string) => any,
) => {
  const roles = applicableFor?.value?.map(
    (roleUuid) => getRole(roleUuid)?.name,
  );
  return (
    <div className="flex gap-1 flex-wrap">
      {roles.slice(0, 2).map((role, index) => (
        <Badge variant={"outline"} className="rounded-sm" key={index}>
          {role}
        </Badge>
      ))}
      {roles.length > 2 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="cursor-pointer" variant={"outline"}>
              + {roles.length - 2}
            </Badge>
          </TooltipTrigger>
          <TooltipContent align="start" className="max-w-80">
            <div className="flex flex-wrap gap-1">
              {roles.slice(2).map((role, index) => (
                <span key={index} className="text-xs">
                  {role}
                  {index < roles.length - 3 && ", "}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export const useLeaveTypesColumns = (
  onEdit?: (leaveType: LeaveTypes) => void,
  org_uuid?: string,
): ColumnDef<LeaveTypes>[] => {
  const [session, setSession] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.leaveTypeSlice);
  const { roles } = useAppSelector((state) => state.rolesSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
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

  const getBadge = (policy: string) => {
    switch (policy) {
      case "Sandwich & Club":
        return "bg-purple-50 text-purple-700 border-purple-100 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "Sandwich":
        return "bg-orange-50 text-orange-700 border-orange-100 dark:border-orange-500 dark:bg-orange-950 dark:text-orange-300";
      case "Club":
        return "bg-cyan-50 text-cyan-700 border-cyan-100 dark:border-cyan-700 dark:bg-cyan-950 dark:text-cyan-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300";
    }
  };

  return [
    ...(hasPermissions(
      "leave_type_management",
      "update",
      currentUserRolePermissions,
      currentUser?.email,
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
                                }),
                              );
                            } else {
                              await dispatch(
                                activateLeaveTypeAction({
                                  org_uuid,
                                  leave_type_uuid,
                                }),
                              );
                            }
                            await dispatch(
                              getLeaveTypesAction({
                                org_uuid: org_uuid!,
                              }),
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex flex-col">
              <p className="font-semibold leading-tight">
                {row.getValue("name")}
              </p>
              <p className="truncate text-xs text-muted-foreground max-w-50">
                {row.original.description}
              </p>
            </div>
          </HoverCardTrigger>
          {row.original.description && (
            <HoverCardContent className="max-w-sm">
              <p className="text-sm">{row.original.description}</p>
            </HoverCardContent>
          )}
        </HoverCard>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="rounded-sm px-2 py-1 text-[11px] font-mono bg-muted"
        >
          {row.getValue("code")}
        </Badge>
      ),
    },
    {
      accessorKey: "accrual",
      header: "Type",
      cell: ({ row }) => {
        const accrual = row.getValue("accrual") as LeaveTypes["accrual"];
        const period = accrual?.period;

        const getAccrualStyle = (period: string) => {
          switch (period) {
            case "monthly":
              return "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
            case "yearly":
              return "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
            case "accrual":
              return "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
            default:
              return "bg-secondary text-secondary-foreground border-border";
          }
        };

        return (
          <Badge
            variant="outline"
            className={`rounded-sm px-2 py-1 text-[11px] ${getAccrualStyle(
              period,
            )}`}
          >
            <Clock size={10} />
            {period
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "applicable_for",
      header: "Applicable For",
      cell: ({ row }) => {
        const applicableFor = row.getValue(
          "applicable_for",
        ) as LeaveTypes["applicable_for"];
        return renderApplicableFor(applicableFor, getRole);
      },
    },
    {
      accessorKey: "policy",
      header: "Policy",
      cell: ({ row }) => {
        let policy;
        if (
          row.original.is_sandwich_enabled &&
          row.original.is_clubbing_enabled
        ) {
          policy = "Sandwich & Club";
        } else if (row.original.is_sandwich_enabled) {
          policy = "Sandwich";
        } else if (row.original.is_clubbing_enabled) {
          policy = "Club";
        } else {
          policy = "Standard";
        }
        return (
          <Badge
            variant={"outline"}
            className={`rounded-sm px-2 py-1 text-[11px] ${getBadge(policy)}`}
          >
            <Tag size={16} className="mr-0.5" />
            {policy}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const dateStr = row.getValue("created_at") as string;
        const date = new Date(dateStr);
        return (
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <p className="text-xs">{date.toLocaleDateString()}</p>
          </div>
        );
      },
    },
    ...(hasPermissions(
      "leave_type_management",
      "update",
      currentUserRolePermissions,
      currentUser?.email,
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
                        size="icon-sm"
                        onClick={() => onEdit?.(row.original)}
                      >
                        {isLoading ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <Pencil height={16} width={16} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </div>
              );
            },
          },
        ]
      : []),
  ];
};
