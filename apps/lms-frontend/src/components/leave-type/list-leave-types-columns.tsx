import { ColumnDef } from "@tanstack/react-table";
import { Calendar, CircleCheck, CircleMinus, Clock, Tag } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useAppDispatch, useAppSelector } from "@/store";
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
import { getBadge } from "@/utils/get-badge";

export type LeaveTypes = {
  uuid: string;
  name: string;
  code: string;
  description: string;
  applicable_for: {
    type: string;
    value:
      | [{ uuid: string; name: string }]
      | [{ user_id: string; name: string }];
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

const renderApplicableFor = (applicableFor: LeaveTypes["applicable_for"]) => {
  const idKey = applicableFor.type === "employee" ? "user_id" : "uuid";

  const labels = (applicableFor.value ?? [])
    .map((val: any) => ({
      uuid: val?.[idKey],
      name: val?.name,
    }))
    .filter((item) => item.uuid && item.name);

  return (
    <div className="flex gap-1 flex-wrap">
      {labels.slice(0, 2).map((label) => (
        <Badge variant={"outline"} className="rounded-sm" key={label.uuid}>
          {label.name}
        </Badge>
      ))}
      {labels.length > 2 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="cursor-pointer" variant={"outline"}>
              + {labels.length - 2}
            </Badge>
          </TooltipTrigger>
          <TooltipContent align="start" className="max-w-80">
            <div className="flex flex-wrap gap-1">
              {labels.slice(2).map((label, index) => (
                <span key={label.uuid} className="text-xs">
                  {label.name}
                  {index < labels.length - 3 && ", "}
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
  org_uuid?: string,
): ColumnDef<LeaveTypes>[] => {
  const [session, setSession] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );

  const { currentUser } = useAppSelector((state) => state.userSlice);

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
      currentUser?.email,
    )
      ? [
          {
            id: "active_inactive",
            header: () => {
              return (
                <div className="text-center w-20">
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
              <p className="text-sm" style={{ wordBreak: "break-word" }}>
                {row.original.description}
              </p>
            </HoverCardContent>
          )}
        </HoverCard>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) =>
        getBadge("default", row.getValue("code"), undefined),
    },
    {
      accessorKey: "accrual",
      header: "Type",
      cell: ({ row }) => {
        const accrual = row.getValue("accrual") as LeaveTypes["accrual"];
        const period = accrual?.period;

        return getBadge(
          period,
          period?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          <Clock size={10} />,
        );
      },
    },
    {
      accessorKey: "applicable_for",
      header: () => {
        return (
          <div className="w-80">
            <p>Applicable For</p>
          </div>
        );
      },
      cell: ({ row }) => {
        const applicableFor = row.getValue(
          "applicable_for",
        ) as LeaveTypes["applicable_for"];
        return renderApplicableFor(applicableFor);
      },
    },
    {
      accessorKey: "max_consecutive_days",
      header: () => {
        return (
          <div className="flex flex-col items-center">
            <p>Max</p>
            <p>Consecutive</p>
          </div>
        );
      },
      cell: ({ row }) => {
        const maxDays = row.getValue("max_consecutive_days") as number | null;
        return (
          <div className="flex justify-center">
            {maxDays !== null ? (
              <div className="inline-flex flex-col items-center">
                <span className="text-xs font-bold">{maxDays} Days</span>
                <span className="text-[10px] text-muted-foreground">
                  Limit Active
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                No Limit
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "allow_negative_leaves",
      header: () => {
        return (
          <div className="flex flex-col items-center w-40">
            <p>Negative Bal.</p>
          </div>
        );
      },
      cell: ({ row }) => {
        const allowNegative = row.getValue("allow_negative_leaves") as boolean;
        return (
          <div className="flex justify-center">
            {allowNegative
              ? getBadge(
                  "Negative Balance Allowed",
                  "Allowed",
                  <CircleCheck size={10} />,
                )
              : getBadge("default", "Restricted", <CircleMinus size={10} />)}
          </div>
        );
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
        return getBadge(policy, policy, <Tag size={10} />);
      },
    },
    {
      accessorKey: "created_at",
      header: () => {
        return (
          <div className="w-20">
            <p>Created At</p>
          </div>
        );
      },
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
  ];
};
