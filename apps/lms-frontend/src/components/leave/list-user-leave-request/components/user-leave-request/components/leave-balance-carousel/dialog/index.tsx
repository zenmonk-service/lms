"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  BalanceLog,
  LeaveBalance,
  LeaveBalanceLogSource,
} from "@/features/leave/leave.types";

interface LeaveBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBalance: LeaveBalance | null;
}

const getLogSourceLabel = (source: BalanceLog["source"]) => {
  const labelMap: Record<LeaveBalanceLogSource, string> = {
    [LeaveBalanceLogSource.LEAVE_APPROVED]: "Leave approved",
    [LeaveBalanceLogSource.SLA_ALLOCATION]: "SLA allocation",
    [LeaveBalanceLogSource.INITIAL_ALLOCATION]: "Initial allocation",
    [LeaveBalanceLogSource.ACCRUAL]: "Accrual",
    [LeaveBalanceLogSource.ROLLOVER]: "Rollover",
    [LeaveBalanceLogSource.BALANCE_ADDITION]: "Balance addition",
    [LeaveBalanceLogSource.BALANCE_DEDUCTION]: "Balance deduction",
  };

  return labelMap[source] ?? source.replaceAll("_", " ");
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const LeaveBalanceDialog = ({
  open,
  onOpenChange,
  selectedBalance,
}: LeaveBalanceDialogProps) => {
  const selectedLogs = useMemo(() => {
    if (!selectedBalance) return [];

    return [...(selectedBalance.balance_logs ?? [])].sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );
  }, [selectedBalance]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-[min(42rem,calc(100vw-1rem))] sm:w-full p-0 overflow-hidden">
        {selectedBalance && (
          <div className="max-h-[85dvh] max-w-full flex flex-col overflow-hidden">
            <div className="bg-linear-to-br from-primary/10 via-background to-muted/30 px-4 py-4 border-b sm:px-6 sm:py-5">
              <DialogHeader className="text-left space-y-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <DialogTitle className="pr-8 text-lg leading-snug sm:text-xl truncate">
                       Balance log: {selectedBalance.leave_type.name}
                    </DialogTitle>
                  </HoverCardTrigger>
                  <HoverCardContent side="bottom" className="max-w-sm break-all">
                    {selectedBalance.leave_type.name} 
                  </HoverCardContent>
                </HoverCard>

                <DialogDescription className="text-xs leading-5 text-muted-foreground sm:text-sm">
                  Current balance {Number(selectedBalance.balance || 0).toFixed(2)}
                  {selectedBalance.final_balance !== null &&
                    selectedBalance.final_balance !== undefined &&
                    ` • Final balance ${selectedBalance.final_balance}`}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Code</p>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <p className="mt-1 max-w-full break-all text-sm font-semibold sm:text-base">
                        {selectedBalance.leave_type.code}
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent side="bottom" className="max-w-sm break-all">
                      {selectedBalance.leave_type.code}
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="rounded-xl border bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Allocated</p>
                  <p className="mt-1 text-sm font-semibold">
                    {selectedBalance.leaves_allocated}
                  </p>
                </div>

                <div className="rounded-xl border bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Logs</p>
                  <p className="mt-1 text-sm font-semibold">{selectedLogs.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5  overflow-y-scroll">
              {selectedLogs.length ? (
                selectedLogs.map((log) => {
                  const linkedLeaveRequest = log.leave_request
                    ? `Linked to leave request from ${log.leave_request.start_date} to ${log.leave_request.end_date}.`
                    : "No leave request is linked to this balance change.";

                  return (
                    <div
                      key={log.uuid}
                      className="rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Badge
                                  variant="secondary"
                                  className="max-w-40 truncate rounded-full px-2 py-0.5 text-[10px] sm:text-xs"
                                >
                                  {getLogSourceLabel(log.source)}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent side="bottom" className="max-w-sm">
                                {getLogSourceLabel(log.source)}
                              </HoverCardContent>
                            </HoverCard>

                            <HoverCard>
                              <HoverCardTrigger asChild>
                              </HoverCardTrigger>
                              <HoverCardContent side="bottom" className="max-w-sm break-all">
                                {log.uuid}
                              </HoverCardContent>
                            </HoverCard>
                          </div>

                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                                <CalendarClock className="h-4 w-4 shrink-0" />
                                <span className="max-w-56 truncate sm:max-w-none">
                                  {formatDateTime(log.created_at)}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="bottom" className="max-w-sm">
                              {formatDateTime(log.created_at)}
                            </HoverCardContent>
                          </HoverCard>

                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <p className="max-w-full truncate text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                                {linkedLeaveRequest}
                              </p>
                            </HoverCardTrigger>
                            <HoverCardContent side="bottom" className="max-w-sm">
                              {linkedLeaveRequest}
                            </HoverCardContent>
                          </HoverCard>
                        </div>

                        <div className="shrink-0 rounded-2xl border bg-background px-4 py-3 text-left sm:text-right">
                          <p className="text-[11px] text-muted-foreground">Updated balance</p>
                          <p className="text-base font-semibold text-primary sm:text-lg">
                            {Number(log.updated_balance).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No balance logs available for this leave type.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaveBalanceDialog;