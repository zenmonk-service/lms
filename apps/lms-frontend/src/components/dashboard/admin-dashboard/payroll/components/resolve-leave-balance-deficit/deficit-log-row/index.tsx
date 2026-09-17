import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

// The last column is unused by non-adjustable rows — a fixed width (not
// auto) keeps it reserving the same space regardless, so columns stay
// aligned across rows instead of each row's grid resizing independently.
const ROW_GRID =
  "grid grid-cols-[1.4fr_0.5fr_1.4fr_0.7fr_6rem] items-center gap-3 rounded-md border border-border bg-background px-3 py-2";

interface IProps {
  log: BalanceLog;
  applied?: AppliedAdjustment;
  draft: Draft;
  donorBalances: LeaveBalance[];
  onDraftChange: (patch: Partial<Draft>) => void;
  onApply: () => void;
  onUndo: () => void;
}

// updated_balance is the resulting balance snapshot after this log, already
// signed — render it as-is rather than inferring a +/- prefix from the
// source, which would double up the sign whenever the snapshot is negative.
const LogAmount = ({ log }: { log: BalanceLog }) => {
  const value = num(log.updated_balance);
  return (
    <span
      className={cn(
        "text-center text-xs font-semibold tabular-nums",
        value < 0 ? "text-destructive" : "text-emerald-600",
      )}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}
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
  // Once applied, settled_against_uuid is a leave_balance id; before that,
  // draft.settled_against is still a leave_type id (from the Select below).
  const donor = donorBalances.find((d) =>
    applied
      ? d.uuid === applied.settled_against_uuid
      : d.leave_type.uuid === draft.settled_against,
  );

  // Only leave-approval debits can be settled against another balance —
  // administratively-set, credit, and settlement-result sources are all
  // informational only.
  const isAdjustable = log.source === LeaveBalanceLogSource.LEAVE_APPROVED;

  if (!isAdjustable) {
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
        // updated_quantity isn't part of the submitted shape — the quantity
        // entered is still available from the draft (never cleared on Apply).
        <span className="text-xs text-muted-foreground">
          {num(draft.quantity).toFixed(1)} from {donor?.leave_type?.name ?? "—"}
        </span>
      ) : (
        <Select
          value={draft.settled_against}
          onValueChange={(v) => onDraftChange({ settled_against: v })}
        >
          <SelectTrigger
            className="w-full"
            size="sm"
            value={draft.settled_against}
            onReset={() => onDraftChange({ settled_against: "" })}
          >
            <SelectValue placeholder="Adjust with…" />
          </SelectTrigger>
          <SelectContent>
            {donorBalances.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                No other leave types available to adjust with.
              </p>
            ) : (
              donorBalances.map((d) => (
                <SelectItem key={d.uuid} value={d.leave_type.uuid}>
                  {d.leave_type?.name} · {num(d.balance).toFixed(1)}
                </SelectItem>
              ))
            )}
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
