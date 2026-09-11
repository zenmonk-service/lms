import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";
import {
  BalanceLog,
  LeaveBalance,
  LeaveBalanceLogSource,
} from "@/features/leave/leave.types";
import {
  AppliedAdjustment,
  Draft,
  isCreditSource,
  num,
  toTitleCase,
} from "../utils";

const ROW_GRID =
  "grid grid-cols-[1.4fr_0.5fr_1.4fr_0.7fr_auto] items-center gap-3 rounded-md border border-border bg-background px-3 py-2";

// Administratively-set sources — never settled against another balance,
// regardless of whether the entry happens to be a credit or a debit.
const LOCKED_SOURCES: LeaveBalanceLogSource[] = [
  LeaveBalanceLogSource.INITIAL_ALLOCATION,
  LeaveBalanceLogSource.SLA_ALLOCATION,
];

interface IProps {
  log: BalanceLog;
  applied?: AppliedAdjustment;
  draft: Draft;
  donorBalances: LeaveBalance[];
  onDraftChange: (patch: Partial<Draft>) => void;
  onApply: () => void;
  onUndo: () => void;
}

const LogAmount = ({ log }: { log: BalanceLog }) => {
  const isCredit = isCreditSource(log.source);
  return (
    <span
      className={cn(
        "text-center text-xs font-semibold tabular-nums",
        isCredit ? "text-emerald-600" : "text-destructive",
      )}
    >
      {isCredit ? "+" : "−"}
      {num(log.leave_balance_deducted).toFixed(1)}
    </span>
  );
};

const DeficitLogRow = ({
  log,
  applied,
  draft,
  donorBalances,
  onDraftChange,
  onApply,
  onUndo,
}: IProps) => {
  // settled_against is always a leave_type id, not a leave_balance id.
  const donor = donorBalances.find(
    (d) =>
      d.leave_type.uuid === (applied?.settled_against ?? draft.settled_against),
  );

  const isLocked = LOCKED_SOURCES.includes(log.source);

  if (isLocked) {
    return (
      <div className={ROW_GRID}>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {toTitleCase(log.source)}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {formatDate(log.created_at)}
          </p>
        </div>

        <LogAmount log={log} />

        <span className="col-span-2 text-xs text-muted-foreground">
          {isCreditSource(log.source) ? "Balance credit" : "Balance adjustment"}{" "}
          — not adjustable
        </span>

        <Badge variant="outline" className="justify-self-end gap-1">
          <Lock className="size-3" />
          Locked
        </Badge>
      </div>
    );
  }

  if (isCreditSource(log.source)) {
    return (
      <div className={ROW_GRID}>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {log.leave_request
              ? `${toTitleCase(log.leave_request.type)} · #${log.leave_request.uuid.slice(0, 8)}`
              : toTitleCase(log.source)}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {formatDate(log.created_at)}
          </p>
        </div>

        <LogAmount log={log} />

        <span className="col-span-2 text-xs text-muted-foreground">
          Balance credit — nothing to settle
        </span>

        <span />
      </div>
    );
  }

  return (
    <div className={ROW_GRID}>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">
          {log.leave_request
            ? `${toTitleCase(log.leave_request.type)} · #${log.leave_request.uuid.slice(0, 8)}`
            : toTitleCase(log.source)}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">
          {formatDate(log.created_at)}
          {log.leave_request?.status_changed_by?.name
            ? ` · by ${log.leave_request.status_changed_by.name}`
            : ""}
        </p>
      </div>

      <LogAmount log={log} />

      {applied ? (
        <span className="text-xs text-muted-foreground">
          {applied.updated_quantity.toFixed(1)} from{" "}
          {donor?.leave_type?.name ?? "—"}
        </span>
      ) : (
        <Select
          value={draft.settled_against}
          onValueChange={(v) => onDraftChange({ settled_against: v })}
        >
          <SelectTrigger
            className="w-full"
            value={draft.settled_against}
            onReset={() => onDraftChange({ settled_against: "" })}
          >
            <SelectValue placeholder="Adjust with…" />
          </SelectTrigger>
          <SelectContent>
            {donorBalances.map((d) => (
              <SelectItem key={d.uuid} value={d.leave_type.uuid}>
                {d.leave_type?.name} · {num(d.balance).toFixed(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {applied ? (
        <span />
      ) : (
        <Input
          type="number"
          step="0.25"
          min={0}
          placeholder="Qty"
          value={draft.quantity}
          onChange={(e) => onDraftChange({ quantity: e.target.value })}
        />
      )}

      {applied ? (
        <Button type="button" variant="outline" size="sm" onClick={onUndo}>
          Undo
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={!draft.settled_against || num(draft.quantity) <= 0}
          onClick={onApply}
        >
          Apply
        </Button>
      )}
    </div>
  );
};

export default DeficitLogRow;
