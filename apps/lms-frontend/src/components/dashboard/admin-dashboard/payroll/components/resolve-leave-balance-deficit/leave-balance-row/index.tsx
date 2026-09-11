import { ChevronRight, Settings2 } from "lucide-react";
import Collapse from "@/shared/motion/collapse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LeaveBalance,
  LeaveBalanceLogSource,
} from "@/features/leave/leave.types";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import DeficitLogRow from "../deficit-log-row";
import {
  AppliedAdjustment,
  BALANCE_GRID,
  Draft,
  isCreditSource,
  num,
} from "../utils";

interface IProps {
  balance: LeaveBalance;
  // Balance after pending (not-yet-saved) adjustments — differs from
  // balance.balance so applying an adjustment reflects instantly in the UI.
  effectiveBalance: number;
  isOpen: boolean;
  onToggle: () => void;
  donorBalances: LeaveBalance[];
  drafts: Record<string, Draft>;
  onDraftChange: (logUuid: string, patch: Partial<Draft>) => void;
  appliedFor: (
    logUuid: string,
    leaveBalanceId: string,
  ) => AppliedAdjustment | undefined;
  onApply: (balance: LeaveBalance, logUuid: string) => void;
  onUndo: (logUuid: string) => void;
  onOpenSla: () => void;
}

const LeaveBalanceRow = ({
  balance,
  effectiveBalance,
  isOpen,
  onToggle,
  donorBalances,
  drafts,
  onDraftChange,
  appliedFor,
  onApply,
  onUndo,
  onOpenSla,
}: IProps) => {
  const can = usePermissionCheck();
  const canProvideSla = can(
    PermissionTag.LEAVE_TYPE_MANAGEMENT,
    PermissionAction.SLA,
  );

  const entitled = num(balance.leaves_allocated);
  const sla = num(balance.sla);
  const bal = effectiveBalance;
  const taken = entitled - num(balance.balance);
  const logs = balance.balance_logs ?? [];
  // Initial allocation and SLA logs are administratively set, never settled
  // against another balance; credits don't need settling either — only real
  // debits from other sources make up the deficit that needs resolving.
  const adjustableLogs = logs.filter(
    (l) =>
      l.source !== LeaveBalanceLogSource.INITIAL_ALLOCATION &&
      l.source !== LeaveBalanceLogSource.SLA_ALLOCATION &&
      !isCreditSource(l.source) &&
      num(l.leave_balance_deducted) > 0,
  );
  const appliedCount = adjustableLogs.filter((l) =>
    appliedFor(l.uuid, balance.uuid),
  ).length;

  const status =
    bal >= 0
      ? "Resolved"
      : appliedCount === 0
        ? "Unresolved"
        : appliedCount === adjustableLogs.length
          ? "Resolved"
          : "In progress";

  return (
    <div className="border-b border-border last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          BALANCE_GRID,
          "w-full cursor-pointer items-center px-4 py-2.5 text-sm hover:bg-accent/40",
        )}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90",
            )}
          />
          {balance.leave_type?.name ?? "—"}
        </span>
        <span className="text-center tabular-nums">{entitled.toFixed(1)}</span>
        <span
          className={cn(
            "text-center tabular-nums",
            sla > 0 ? "text-emerald-600" : "text-muted-foreground",
          )}
        >
          {sla > 0 ? `+${sla.toFixed(1)}` : "—"}
        </span>
        <span className="text-center tabular-nums">{taken.toFixed(1)}</span>
        <span
          className={cn(
            "text-center font-semibold tabular-nums",
            bal < 0 && "text-destructive",
          )}
        >
          {bal.toFixed(1)}
        </span>
        <span
          className={cn(
            "text-right text-[11px] font-medium",
            status === "Unresolved" && "text-muted-foreground",
            status === "In progress" && "text-amber-600",
            status === "Resolved" && "text-emerald-600",
          )}
        >
          {status}
        </span>
        <span className="flex justify-center">
          {canProvideSla && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-6"
              title="Provide SLA allocation"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSla();
              }}
            >
              <Settings2 className="size-3.5" />
            </Button>
          )}
        </span>
      </div>

      <Collapse open={isOpen}>
        <div className="bg-muted/30 px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold text-muted-foreground">
            Balance log
          </p>

          {logs.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No entries on this balance.
            </p>
          )}

          <div className="space-y-2">
            {logs.map((log) => (
              <DeficitLogRow
                key={log.uuid}
                log={log}
                applied={appliedFor(log.uuid, balance.uuid)}
                draft={
                  drafts[log.uuid] ?? { settled_against: "", quantity: "" }
                }
                donorBalances={donorBalances}
                onDraftChange={(patch) => onDraftChange(log.uuid, patch)}
                onApply={() => onApply(balance, log.uuid)}
                onUndo={() => onUndo(log.uuid)}
              />
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default LeaveBalanceRow;
