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
import { getLeaveBalanceAction } from "@/features/leave/get-leave-balance/get-leave-balance.action";
import { resolveLeaveBalanceDeficitAction } from "@/features/leave/resolve-leave-balance-deficit/resolve-leave-balance-deficit.action";
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
  /** Called after adjustments are saved — the backend regenerates the user's
   * payroll record, so the caller should refetch its payroll list. */
  onResolve?: () => Promise<void> | void;
}

const ResolveLeaveBalanceDeficit = ({
  open,
  onOpenChange,
  user_uuid,
  user_name,
  period,
  onResolve,
}: IProps) => {
  const dispatch = useAppDispatch();
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );
  const {
    userLeaveBalances,
    leaveBalancesLoading,
    resolveLeaveBalanceDeficitLoading,
  } = useAppSelector((state) => state.leaveSlice);

  const [scope, setScope] = useState<Scope>("negative");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [slaLeaveTypeUuid, setSlaLeaveTypeUuid] = useState<string | null>(null);
  // Local mirror of userLeaveBalances — a full redux refetch would replace
  // this array's identity and reset the in-progress adjustments form below,
  // so a single balance updated via SLA is patched in here instead.
  const [balances, setBalances] = useState<LeaveBalance[]>([]);

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
        listUserLeaveBalancesAction({ org_uuid, user_uuid, period , is_sealed: false , is_me: "false" }),
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
  }, [open, org_uuid, user_uuid, period]);

  useEffect(() => {
    setBalances(userLeaveBalances);
  }, [userLeaveBalances]);

  const adjustments = form.watch("adjustments") ?? [];

  const getEffectiveBalance = (balance: LeaveBalance) => {
    for (let i = adjustments.length - 1; i >= 0; i--) {
      if (adjustments[i].leave_balance_uuid === balance.uuid) {
        return num(adjustments[i].updated_balance);
      }
    }
    return num(balance.balance);
  };

  const totalDeficit = useMemo(
    () =>
      balances.reduce(
        (sum, b) => sum + Math.min(0, getEffectiveBalance(b)),
        0,
      ),
    [balances, adjustments],
  );

  const donorBalances = useMemo(
    () =>
      balances
        .filter((b) => getEffectiveBalance(b) > 0)
        .map((b) => ({ ...b, balance: String(getEffectiveBalance(b)) })),
    [balances, adjustments],
  );

  const visibleBalances = useMemo(() => {
    const q = search.trim().toLowerCase();
    return balances.filter((b) => {
      if (scope === "negative" && num(b.balance) >= 0) return false;
      if (q && !b.leave_type?.name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [balances, scope, search]);

  const appliedFor = (logUuid: string, leaveBalanceUuid: string) =>
    fields.find(
      (f) =>
        (f as unknown as AppliedAdjustment)._logUuid === logUuid &&
        (f as unknown as AppliedAdjustment).leave_balance_uuid ===
          leaveBalanceUuid,
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

    const donor = balances.find((b) => b.leave_type.uuid === draft.settled_against);
    if (!donor) return;

    const qty = num(draft.quantity);
    // Defense-in-depth: the UI already caps qty at the donor's live
    // remaining (effective) balance and disables Apply past it, but guard
    // here too in case this is ever reached with a stale draft.
    if (qty > getEffectiveBalance(donor)) return;

    const donorBalanceAfter = getEffectiveBalance(donor) - qty;
    const recipientBalanceAfter = getEffectiveBalance(balance) + qty;

    append([
      {
        leave_balance_uuid: balance.uuid,
        leave_type_uuid: balance.leave_type.uuid,
        updated_balance: recipientBalanceAfter,
        amount: qty,
        is_credit: true,
        settled_against_uuid: donor.uuid,
        _logUuid: logUuid,
      },
      {
        leave_balance_uuid: donor.uuid,
        leave_type_uuid: donor.leave_type.uuid,
        updated_balance: donorBalanceAfter,
        amount: qty,
        is_credit: false,
        settled_against_uuid: balance.uuid,
        _logUuid: logUuid,
      },
    ] as unknown as ResolveLeaveBalanceDeficitFormValues["adjustments"]);
  };

  const handleUndo = (logUuid: string) => {
    const indices = fields
      .map((f, i) => (f as unknown as AppliedAdjustment)._logUuid === logUuid ? i : -1)
      .filter((i) => i !== -1);
    if (indices.length > 0) remove(indices);
  };

  const handleSlaResolved = async () => {
    if (!org_uuid || !user_uuid || !slaLeaveTypeUuid) return;

    const updatedBalance = await dispatch(
      getLeaveBalanceAction({
        org_uuid,
        user_uuid,
        period,
        leave_type_uuid: slaLeaveTypeUuid,
      }),
    ).unwrap();

    setBalances((prev) =>
      prev.map((b) => (b.uuid === updatedBalance.uuid ? updatedBalance : b)),
    );

    // Backend also regenerates this user's payroll record on SLA allocation
    // — let the caller (the payroll table) know it needs a refetch too.
    await onResolve?.();
  };

  const onSubmit = async (data: ResolveLeaveBalanceDeficitFormValues) => {
    if (!org_uuid) return;

    const result = await dispatch(
      resolveLeaveBalanceDeficitAction({
        org_uuid,
        user_uuid,
        adjustments: data.adjustments.map((a) => ({
          leave_balance_uuid: a.leave_balance_uuid,
          updated_balance: a.updated_balance,
          amount: a.amount,
          is_credit: a.is_credit,
          settled_against_uuid: a.settled_against_uuid,
        })),
      }),
    );

    if (resolveLeaveBalanceDeficitAction.fulfilled.match(result)) {
      onOpenChange(false);
      await onResolve?.();
    }
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
                {totalDeficit.toFixed(2)}
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
            disabled={
              !form.formState.isDirty || resolveLeaveBalanceDeficitLoading
            }
          />
        </form>

        <ProvideSlaModal
          open={!!slaLeaveTypeUuid}
          onOpenChange={() => setSlaLeaveTypeUuid(null)}
          selectedUserUuid={user_uuid}
          period={period}
          defaultLeaveTypeUuid={slaLeaveTypeUuid ?? undefined}
          onResolve={handleSlaResolved}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResolveLeaveBalanceDeficit;
