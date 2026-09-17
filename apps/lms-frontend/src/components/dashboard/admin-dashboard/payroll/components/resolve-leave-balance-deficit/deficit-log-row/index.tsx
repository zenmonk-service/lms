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

// A full "September 17, 2026 – September 20, 2026" doesn't fit this column
// on one line — drop the repeated month/year when they match on both ends.
const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const monthDay = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${monthDay(startDate)} – ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }
    return `${monthDay(startDate)} – ${monthDay(endDate)}, ${endDate.getFullYear()}`;
  }
  return `${monthDay(startDate)}, ${startDate.getFullYear()} – ${monthDay(endDate)}, ${endDate.getFullYear()}`;
};

interface IProps {
  log: BalanceLog;
  applied?: AppliedAdjustment;
  draft: Draft;
  donorBalances: LeaveBalance[];
  onDraftChange: (patch: Partial<Draft>) => void;
  onApply: () => void;
  onUndo: () => void;
}

// `amount` is the unsigned magnitude of the change this log represents —
// direction comes from `source` (via isCreditSource). `updated_balance` is
// the resulting balance snapshot right after this log — shown underneath so
// both "how much changed" and "what it left the balance at" are visible.
const LogAmount = ({ log }: { log: BalanceLog }) => {
  const magnitude = num(log.amount);
  const isCredit = isCreditSource(log.source);
  return (
    <div className="flex flex-col items-center leading-tight">
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          isCredit ? "text-emerald-600" : "text-destructive",
        )}
      >
        {isCredit ? "+" : "-"}
        {magnitude.toFixed(2)}
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        bal {num(log.updated_balance).toFixed(2)}
      </span>
    </div>
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

  // The qty that can be pulled from the selected donor is capped by that
  // leave type's own available balance — recomputed whenever the donor
  // selection changes, since `donor` already tracks draft.settled_against.
  const isDonorSelected = !!draft.settled_against && !!donor;
  const maxQty = isDonorSelected ? num(donor!.balance) : undefined;
  const exceedsMax = maxQty !== undefined && num(draft.quantity) > maxQty;

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
          {log.leave_request
            ? log.leave_request.start_date === log.leave_request.end_date
              ? formatDate(log.leave_request.start_date)
              : formatDateRange(
                  log.leave_request.start_date,
                  log.leave_request.end_date,
                )
            : formatDate(log.created_at)}
          {log.leave_request?.status_changed_by?.name
            ? ` · by ${log.leave_request.status_changed_by.name}`
            : ""}
          {num(log.leave_request?.penalty) > 0 && (
            <span className="text-destructive">
              {" "}
              · +{num(log.leave_request?.penalty).toFixed(2)} penalty
            </span>
          )}
        </p>
      </div>

      <LogAmount log={log} />

      {applied ? (
        // updated_quantity isn't part of the submitted shape — the quantity
        // entered is still available from the draft (never cleared on Apply).
        <span className="text-xs text-muted-foreground">
          {num(draft.quantity).toFixed(2)} from {donor?.leave_type?.name ?? "—"}
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
                  {d.leave_type?.name} · {num(d.balance).toFixed(2)}
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
          max={maxQty}
          disabled={!isDonorSelected}
          aria-invalid={exceedsMax}
          placeholder={
            isDonorSelected ? `Qty (max ${maxQty!.toFixed(2)})` : "Qty"
          }
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
          disabled={!isDonorSelected || num(draft.quantity) <= 0 || exceedsMax}
          onClick={onApply}
        >
          Apply
        </Button>
      )}
    </div>
  );
};

export default DeficitLogRow;
