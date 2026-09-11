import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listUserLeaveBalancesAction } from "@/features/leave/list-user-leave-balance/list-user-leave-balance.action";
import { LeaveBalance } from "@/features/leave/leave.types";
import {
  resolveLeaveBalanceDeficitSchema,
  ResolveLeaveBalanceDeficitFormValues,
} from "@/components/leave/leave.types";
import { ProvideSlaModal } from "@/components/dashboard/shared/sla-modal";
import BalanceFilterBar from "./balance-filter-bar";
import LeaveBalanceRow from "./leave-balance-row";
import DeficitSummaryFooter from "./deficit-summary-footer";
import { BalanceListSkeleton } from "./balance-list-skeleton";
import { AppliedAdjustment, BALANCE_GRID, Draft, num, Scope } from "./utils";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user_uuid: string;
  user_name?: string;
  period: string;
}

const ResolveLeaveBalanceDeficit = ({
  open,
  onOpenChange,
  user_uuid,
  user_name,
  period,
}: IProps) => {
  const dispatch = useAppDispatch();
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );
  const { userLeaveBalances, leaveBalancesLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );

  const [scope, setScope] = useState<Scope>("negative");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [slaLeaveTypeUuid, setSlaLeaveTypeUuid] = useState<string | null>(null);

  const form = useForm<ResolveLeaveBalanceDeficitFormValues>({
    resolver: zodResolver(resolveLeaveBalanceDeficitSchema),
    defaultValues: { adjustments: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "adjustments",
  });

  const refetchBalances = async () => {
    if (org_uuid && user_uuid) {
      await dispatch(
        listUserLeaveBalancesAction({ org_uuid, user_uuid, period }),
      );
    }
  };

  useEffect(() => {
    if (open) refetchBalances();
    if (!open) {
      form.reset({ adjustments: [] });
      setDrafts({});
      setExpanded(new Set());
      setSearch("");
      setScope("negative");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, org_uuid, user_uuid, period]);

  const adjustments = form.watch("adjustments") ?? [];

  // Lets Apply reflect instantly in the UI without touching redux/the backend.
  // Entries only snapshot `original_balance` (the value *before* that leg), so
  // the current effective balance is the real balance plus every pending
  // leg's signed quantity for it (_direction says which way it moves).
  const getEffectiveBalance = (balance: LeaveBalance) => {
    let delta = 0;
    for (const a of adjustments) {
      if (a.leave_balance_id !== balance.uuid) continue;
      const sign =
        (a as unknown as AppliedAdjustment)._direction === "debit" ? -1 : 1;
      delta += sign * num(a.updated_quantity);
    }
    return num(balance.balance) + delta;
  };

  const totalDeficit = useMemo(
    () =>
      userLeaveBalances.reduce(
        (sum, b) => sum + Math.min(0, getEffectiveBalance(b)),
        0,
      ),
    [userLeaveBalances, adjustments],
  );

  // Balances that can be drawn from (positive effective balance), for the
  // "Adjust with" select — amount shown accounts for quantities already
  // pending against other deficits so it can't be double-spent in the UI.
  const donorBalances = useMemo(
    () =>
      userLeaveBalances
        .filter((b) => getEffectiveBalance(b) > 0)
        .map((b) => ({ ...b, balance: String(getEffectiveBalance(b)) })),
    [userLeaveBalances, adjustments],
  );

  const visibleBalances = useMemo(() => {
    const q = search.trim().toLowerCase();
    return userLeaveBalances.filter((b) => {
      if (scope === "negative" && num(b.balance) >= 0) return false;
      if (q && !b.leave_type?.name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [userLeaveBalances, scope, search]);

  // A settlement writes two legs (one per balance) tagged with the same
  // _logUuid — pick the leg that belongs to `leaveBalanceId` so each row shows
  // its own side of the transfer.
  const appliedFor = (logUuid: string, leaveBalanceId: string) =>
    fields.find(
      (f) =>
        (f as unknown as AppliedAdjustment)._logUuid === logUuid &&
        (f as unknown as AppliedAdjustment).leave_balance_id === leaveBalanceId,
    ) as AppliedAdjustment | undefined;

  const toggle = (uuid: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(uuid) ? next.delete(uuid) : next.add(uuid);
      return next;
    });

  const handleDraftChange = (logUuid: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({
      ...prev,
      [logUuid]: {
        ...(prev[logUuid] ?? { settled_against: "", quantity: "" }),
        ...patch,
      },
    }));

  const handleApply = (balance: LeaveBalance, logUuid: string) => {
    const draft = drafts[logUuid];
    if (!draft?.settled_against || num(draft.quantity) <= 0) return;

    // draft.settled_against is a leave_type id (see donorBalances/Select below).
    const donor = userLeaveBalances.find(
      (b) => b.leave_type.uuid === draft.settled_against,
    );
    if (!donor) return;

    const qty = num(draft.quantity);
    // original_balance is always the leave type's real, stored balance — not
    // the in-session effective value that nets out other pending adjustments.
    // `donor`/`balance` come straight from userLeaveBalances, so `.balance` is
    // that true value regardless of what's already been applied this session.
    const donorOriginalBalance = num(donor.balance);
    const recipientOriginalBalance = num(balance.balance);

    // One settlement writes both legs of the ledger, the balance being fixed
    // first and the donor it's drawn from second — each as its own entry,
    // pointing at the other's leave_type via settled_against (never a
    // leave_balance id).
    append([
      {
        leave_balance_id: balance.uuid,
        updated_quantity: qty,
        original_balance: recipientOriginalBalance,
        settled_against: donor.leave_type.uuid,
        // client-only markers: map an applied entry back to its deficit log,
        // and record which way it moves its own balance
        _logUuid: logUuid,
        _direction: "credit",
      },
      {
        leave_balance_id: donor.uuid,
        updated_quantity: qty,
        original_balance: donorOriginalBalance,
        settled_against: balance.leave_type.uuid,
        _logUuid: logUuid,
        _direction: "debit",
      },
    ] as unknown as ResolveLeaveBalanceDeficitFormValues["adjustments"]);
  };

  const handleUndo = (logUuid: string) => {
    const indices = fields
      .map((f, i) =>
        (f as unknown as AppliedAdjustment)._logUuid === logUuid ? i : -1,
      )
      .filter((i) => i !== -1);
    if (indices.length > 0) remove(indices);
  };

  const onSubmit = (data: ResolveLeaveBalanceDeficitFormValues) => {
    const payload = {
      user_uuid,
      period,
      adjustments: data.adjustments.map((a) => ({
        leave_balance_id: a.leave_balance_id,
        updated_quantity: a.updated_quantity,
        original_balance: a.original_balance,
        settled_against: a.settled_against,
      })),
    };
    // eslint-disable-next-line no-console
    console.log("Resolve leave balance deficit ⇒", payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {period} - {user_name && user_name}
              </p>
              <DialogTitle>Resolve leave balance deficit</DialogTitle>
              <DialogDescription>
                Expand a negative balance to adjust its logs one by one.
              </DialogDescription>
            </div>
            <div className="mt-auto text-right">
              <p
                className={cn(
                  "text-xl font-bold tabular-nums",
                  totalDeficit < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {totalDeficit.toFixed(1)}
              </p>
              <p className="text-[11px] text-muted-foreground">days total</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <BalanceFilterBar
            search={search}
            onSearchChange={setSearch}
            scope={scope}
            onScopeChange={setScope}
          />

          <div className="rounded-lg border border-border">
            <div
              className={cn(
                BALANCE_GRID,
                "border-b border-border px-4 py-2 text-xs font-medium",
              )}
            >
              <span>Leave type</span>
              <span className="text-center">Entitled</span>
              <span className="text-center">SLA</span>
              <span className="text-center">Taken</span>
              <span className="text-center">Balance</span>
              <span className="text-right">Status</span>
              <span />
            </div>

            <div className="max-h-[45vh] overflow-y-auto">
              {leaveBalancesLoading ? (
                <BalanceListSkeleton />
              ) : (
                <>
                  {visibleBalances.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No balances to show.
                    </p>
                  )}

                  {visibleBalances.map((balance) => (
                    <LeaveBalanceRow
                      key={balance.uuid}
                      balance={balance}
                      effectiveBalance={getEffectiveBalance(balance)}
                      isOpen={expanded.has(balance.uuid)}
                      onToggle={() => toggle(balance.uuid)}
                      donorBalances={donorBalances}
                      drafts={drafts}
                      onDraftChange={handleDraftChange}
                      appliedFor={appliedFor}
                      onApply={handleApply}
                      onUndo={handleUndo}
                      onOpenSla={() =>
                        setSlaLeaveTypeUuid(balance.leave_type.uuid)
                      }
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <DeficitSummaryFooter
            onCancel={() => onOpenChange(false)}
            disabled={!form.formState.isDirty}
          />
        </form>

        <ProvideSlaModal
          open={!!slaLeaveTypeUuid}
          onOpenChange={() => setSlaLeaveTypeUuid(null)}
          selectedUserUuid={user_uuid}
          period={period}
          defaultLeaveTypeUuid={slaLeaveTypeUuid ?? undefined}
          onResolve={refetchBalances}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResolveLeaveBalanceDeficit;
