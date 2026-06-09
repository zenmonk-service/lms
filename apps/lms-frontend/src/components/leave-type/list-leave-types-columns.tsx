import { ColumnDef } from "@tanstack/react-table";
import { Clock, Info, Tag } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useAppDispatch, useAppSelector } from "@/store";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { getSession } from "@/app/auth/get-auth.action";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { hasPermissions } from "@/lib/haspermissios";
import { getBadge } from "@/utils/get-badge";
import { Button } from "../ui/button";
import { deactivateLeaveTypeAction } from "@/features/leave/deactivate-leave-type/deactivate-leave-type.action";
import { activateLeaveTypeAction } from "@/features/leave/activate-leave-type/activate-leave-type.action";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";

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
  carry_forward: boolean;
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

  const [optimisticStates, setOptimisticStates] = useState<
    Record<string, boolean>
  >({});

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
              const leave_type_uuid = leaveType.uuid;

              const isActive =
                optimisticStates[leave_type_uuid] ?? leaveType.is_active;

              return (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Switch
                          checked={isActive}
                          onClick={async () => {
                            const newState = !isActive;
                            setOptimisticStates((prev) => ({
                              ...prev,
                              [leave_type_uuid]: newState,
                            }));

                            try {
                              if (isActive) {
                                await dispatch(
                                  deactivateLeaveTypeAction({
                                    org_uuid: org_uuid!,
                                    leave_type_uuid,
                                  }),
                                );
                              } else {
                                await dispatch(
                                  activateLeaveTypeAction({
                                    org_uuid: org_uuid!,
                                    leave_type_uuid,
                                  }),
                                );
                              }

                              await dispatch(
                                listLeaveTypesAction({
                                  org_uuid: org_uuid!,
                                }),
                              );

                              setOptimisticStates((prev) => {
                                const updated = { ...prev };
                                delete updated[leave_type_uuid];
                                return updated;
                              });
                            } catch (error) {
                              setOptimisticStates((prev) => {
                                const updated = { ...prev };
                                delete updated[leave_type_uuid];
                                return updated;
                              });
                            }
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
      accessorKey: "info",
      header: "",
      cell: ({ row }) => {
        const leaveType = row.original;
        const leave = leaveType;
        const applicableFor = leaveType.applicable_for.type;
        const getApplicablePreviewLabels = (
          leave: LeaveTypes,
          applicableFor: string,
        ) => {
          return (leave.applicable_for?.value ?? [])
            .map((val) => {
              if (applicableFor === "employee" && "user_id" in val) {
                return { id: val.user_id, label: val.name };
              }
              if (applicableFor === "role" && "uuid" in val) {
                return { id: val.uuid, label: val.name };
              }
              return { id: undefined, label: undefined };
            })
            .filter((item) => item.id && item.label);
        };
        const getPolicyMode = (leave: LeaveTypes) => {
          if (leave.is_sandwich_enabled && leave.is_clubbing_enabled)
            return "Sandwich & Club";
          if (leave.is_sandwich_enabled) return "Sandwich";
          if (leave.is_clubbing_enabled) return "Club";
          return "Standard";
        };
        return (
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button size={"icon-sm"} variant={"ghost"}>
                    <Info size={16} />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">View details</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Leave Type Details</DialogTitle>
              </DialogHeader>
              <div className="mt-3 overflow-hidden rounded-md border alternate-bg">
                <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{leave.name}</span>
                </div>
                {leave.description && (
                  <div className="border-b px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Description</span>
                    <p
                      className="font-medium whitespace-pre-wrap"
                      style={{ wordBreak: "break-word" }}
                    >
                      {leave.description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono font-medium">
                    {leave.code?.toUpperCase?.()}
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Applies To</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {applicableFor}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({leave.applicable_for?.value?.length || 0})
                    </span>
                  </div>
                </div>
                <div className="border-b px-3 py-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {getApplicablePreviewLabels(leave, applicableFor).map(
                      (item) => (
                        <Badge
                          variant="outline"
                          className="rounded-sm"
                          key={item.id}
                        >
                          {item.label}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Accrual</span>
                  <span className="font-medium capitalize">
                    {leave.accrual?.period === "no_accrual"
                      ? "No Accrual"
                      : leave.accrual?.period}
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Leave Count</span>
                  <span className="font-medium">
                    {leave.accrual?.leave_count} days
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Policy Mode</span>
                  <span className="font-medium">{getPolicyMode(leave)}</span>
                </div>
                <div className="grid grid-cols-2 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Max Consecutive Days
                  </span>
                  <span className="font-medium">
                    {leave.max_consecutive_days !== null &&
                    leave.max_consecutive_days !== undefined
                      ? `${leave.max_consecutive_days} days`
                      : "Not limited"}
                  </span>
                </div>
                <div className="grid grid-cols-2 border-t px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Negative Balance
                  </span>
                  <span className="font-medium">
                    {leave.allow_negative_leaves ? "Allowed" : "Restricted"}
                  </span>
                </div>
                <div className="grid grid-cols-2 border-t px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Carry Forward
                  </span>
                  <span className="font-medium">
                    {leave.carry_forward ? "Allowed" : "Restricted"}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      },
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
  ];
};
