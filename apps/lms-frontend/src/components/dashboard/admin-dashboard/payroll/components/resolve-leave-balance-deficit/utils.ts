import { ResolveLeaveBalanceDeficitFormValues } from "@/components/leave/leave.types";
import { LeaveBalanceLogSource } from "@/features/leave/leave.types";

export type Scope = "negative" | "all";

// Sources that always add to the balance — every other source is a debit.
// Direction is implied by the source itself; the stored amount is always
// a plain, non-negative magnitude.
const CREDIT_SOURCES: LeaveBalanceLogSource[] = [
  LeaveBalanceLogSource.INITIAL_ALLOCATION,
  LeaveBalanceLogSource.SLA_ALLOCATION,
  LeaveBalanceLogSource.ACCRUAL,
  LeaveBalanceLogSource.ROLLOVER,
];

export const isCreditSource = (source: LeaveBalanceLogSource) =>
  CREDIT_SOURCES.includes(source);

export type Draft = { settled_against: string; quantity: string };

// One applied array entry, tagged with which deficit log row it belongs to
// (_logUuid) and which way it moves its own balance (_direction) — both
// client-only, stripped by zod before submit. _direction lets effective
// balances be recomputed from `original_balance` snapshots, since those no
// longer carry the post-settlement value themselves.
export type AppliedAdjustment =
  ResolveLeaveBalanceDeficitFormValues["adjustments"][number] & {
    _logUuid: string;
    _direction: "credit" | "debit";
  };

export const toTitleCase = (value?: string) =>
  (value ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const num = (value: string | number | null | undefined) =>
  Number(value ?? 0);

export const BALANCE_GRID =
  "grid grid-cols-[1.6fr_0.6fr_0.6fr_0.6fr_0.7fr_1fr_0.5fr] gap-3";
