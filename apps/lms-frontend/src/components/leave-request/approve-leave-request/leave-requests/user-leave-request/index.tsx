"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  ArrowDownToLine,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleCheckBig,
  CircleX,
  Clock,
  Dot,
  File,
  FileText,
  Layers,
  LoaderCircle,
  Mail,
  Paperclip,
  Phone,
  SquareUser,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
  recommendLeaveRequestAction,
  approvableLeaveRequestsAction,
  getUserLeaveRequestAction,
} from "@/features/leave-requests/leave-requests.action";
import { getSession } from "@/app/auth/get-auth.action";
import { Progress } from "@/components/ui/progress";
import { SkeletonUserLeaveRequest } from "./skeleton";
import LeaveActionModal from "../../modal";
import { getBadge } from "@/utils/get-badge";
import { useSearchParams } from "next/navigation";

type LeaveAction = "approve" | "reject" | "recommend" | null;

const UserLeaveRequest = () => {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const dispatch = useAppDispatch();
  const {
    selectedLeaveRequest,
    isSelectedLeaveRequestLoading,
  } = useAppSelector((s) => s.leaveRequestSlice);
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveAction, setLeaveAction] = useState<LeaveAction>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!uuid || !currentOrganization.uuid || !currentUser?.user_id) return;

    dispatch(
      getUserLeaveRequestAction({
        org_uuid: currentOrganization.uuid,
        user_uuid: currentUser.user_id,
        leave_request_uuid: uuid,
      }),
    );
  }, [uuid]);

  const openModal = (actionMode: LeaveAction) => {
    setLeaveAction(actionMode);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setLeaveAction(null);
  };

  const handleModalConfirm = async (remarkText: string) => {
    if (!selectedLeaveRequest || !leaveAction || !currentOrganization.uuid)
      return;

    const session = await getSession();
    if (!session?.user?.uuid) return;

    const payloadWithOrg = {
      leave_request_uuid: selectedLeaveRequest.uuid,
      manager_uuid: session.user.uuid,
      remark: remarkText,
      org_uuid: currentOrganization.uuid,
    };

    try {
      setActionLoading(true);
      if (leaveAction === "approve") {
        const status_changed_to = LeaveRequestStatus.APPROVED;
        const payload = {
          ...payloadWithOrg,
          status_changed_to,
          user_uuid: selectedLeaveRequest.user.user_id,
        };
        await dispatch(approveLeaveRequestAction(payload)).unwrap();
      } else if (leaveAction === "reject") {
        const status_changed_to = LeaveRequestStatus.REJECTED;
        const payload = { ...payloadWithOrg, status_changed_to };
        await dispatch(rejectLeaveRequestAction(payload)).unwrap();
      } else if (leaveAction === "recommend") {
        const status_changed_to = LeaveRequestStatus.RECOMMENDED;
        const payload = { ...payloadWithOrg, status_changed_to };
        await dispatch(recommendLeaveRequestAction(payload)).unwrap();
      }
      const payload = {
        org_uuid: currentOrganization.uuid,
        manager_uuid: currentUser.user_id,
        page: 1,
        limit: 10,
        isInfiniteScroll: true,
      };
      await dispatch(approvableLeaveRequestsAction(payload));
      await dispatch(
        getUserLeaveRequestAction({
          org_uuid: currentOrganization.uuid,
          user_uuid: currentUser?.user_id,
          leave_request_uuid: selectedLeaveRequest.uuid,
        }),
      );
      closeModal();
    } catch (err) {
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (formatDateStr: string) => {
    const date = new Date(formatDateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPeriod = (periodStr: string) => {
    try {
      const date = new Date(periodStr + "-01");
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return periodStr;
    }
  };

  if (isSelectedLeaveRequestLoading) return <SkeletonUserLeaveRequest />;

  if (!selectedLeaveRequest || !uuid) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              No Leave Request Selected
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a leave request from the queue to review details and take
              action
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status_changed_by_you =
    selectedLeaveRequest.status_changed_by?.some(
      (user) => user.user_id === currentUser?.user_id,
    ) ?? false;
  const isPending = selectedLeaveRequest.status === LeaveRequestStatus.PENDING;
  const isRecommended =
    selectedLeaveRequest.status === LeaveRequestStatus.RECOMMENDED;

  const canTakeAction = !status_changed_by_you && (isPending || isRecommended);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 p-4 border-b border-border">
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedLeaveRequest.user.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedLeaveRequest.user.role.name}
            </p>
          </div>
          <div className="flex text-muted-foreground gap-3">
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <p className="text-xs">
                {selectedLeaveRequest.user.email}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <p className="text-xs">+91 78YYXXXZZZ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto border-b border-border">
        <div className="flex gap-4">
          <div className="bg-background rounded-lg border border-border p-3 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <p className="font-semibold text-sm">Leave Details</p>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 w-full">
              <div className="space-y-1 flex-1">
                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Layers size={10} /> Leave Type
                </p>
                <p className="text-xs font-semibold">
                  {selectedLeaveRequest?.leave_type.name}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <CalendarDays size={10} /> Type
                  </p>
                  <p className="text-xs font-semibold">
                    {selectedLeaveRequest?.type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <CalendarDays size={10} /> Range
                  </p>
                  <p className="text-xs font-semibold">
                    {selectedLeaveRequest?.range
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={14} />
                  <p className="text-xs text-muted-foreground">Start Date:</p>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <p className="text-xs text-muted-foreground">End Date:</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <p className="text-xs text-muted-foreground">Duration:</p>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <p className="text-xs text-muted-foreground">Submitted:</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs font-semibold text-end">
                  {formatDate(selectedLeaveRequest.start_date)}
                </p>
                <p className="text-xs font-semibold text-end">
                  {formatDate(selectedLeaveRequest.end_date)}
                </p>
                <p className="text-xs font-semibold text-end">
                  {selectedLeaveRequest.leave_duration} days
                </p>
                <p className="text-xs font-semibold text-end">
                  {selectedLeaveRequest.created_at.split("T")[0]}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border p-3 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <ChartNoAxesColumnIncreasing size={16} />
              <p className="font-semibold text-sm">Leave Balance Breakdown</p>
            </div>
            {selectedLeaveRequest.leave_type.leave_balances.map(
              (balance, index) => {
                const total = Number(balance.leaves_allocated) || 0;
                const remaining = Number(balance.balance) || 0;
                const used = total - remaining;
                const percentage = total > 0 ? (remaining / total) * 100 : 0;

                return (
                  <div key={index} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays size={14} />
                        <p className="text-xs font-semibold">
                          {balance.period
                            ? formatPeriod(balance.period)
                            : `Period ${index + 1}`}
                        </p>
                      </div>
                      {index === 0 &&
                        selectedLeaveRequest.leave_type.leave_balances.length >
                          1 && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Current Month Impact
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Total
                        </p>
                        <p className="text-sm font-bold">
                          {total}{" "}
                          <span className="text-[10px] font-normal">days</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Used
                        </p>
                        <p className="text-sm font-bold">{used.toFixed(1)}</p>
                      </div>
                      <div className="flex flex-col items-end text-end">
                        <p className="text-[10px] text-primary uppercase font-semibold">
                          Remaining
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {remaining}{" "}
                          <span className="text-[10px] font-normal">days</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress value={percentage} />
                      <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                        <span>0%</span>
                        <span>{Math.round(percentage)}% available</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="bg-background rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <p className="font-semibold text-sm">Reason for Leave</p>
          </div>
          <p
            className="text-xs leading-relaxed mt-2 w-full max-w-full "
            style={{ wordBreak: "break-word" }}
          >
            {selectedLeaveRequest?.reason || "No reason provided."}
          </p>
        </div>

        <div className="bg-background rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <Paperclip size={16} />
            <p className="font-semibold text-sm">Attachments</p>
          </div>
          <div className="p-4 bg-card border mt-4 rounded-sm">
            <div className="flex items-center gap-2">
              <File size={18} />
              <div className="flex flex-col">
                <p className="text-xs">medical_certificate.pdf</p>
                <div className="flex items-center">
                  <p className="text-xs text-background-foreground">256 KB</p>
                  <Dot className="text-background-foreground" />
                  <p className="text-xs text-background-foreground">PDF</p>
                </div>
              </div>
              <div className="justify-end flex flex-1">
                <ArrowDownToLine size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <SquareUser size={16} />
            <p className="font-semibold text-sm">Manager</p>
          </div>
          <div className="flex flex-col bg-card gap-2 mt-2 border border-border rounded">
            {selectedLeaveRequest.managers.map((manager, index) => (
              <div
                key={index}
                className="p-3 border-b border-border last:border-0 flex gap-2"
              >
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs font-medium">{manager.user.name}</p>
                      <p className="text-xs text-background-foreground">
                        {manager.user.email}
                      </p>
                    </div>
                    {manager.status_changed_to &&
                      getBadge(
                        manager.status_changed_to,
                        manager.status_changed_to,
                        undefined,
                        undefined,
                        "h-fit",
                      )}
                  </div>
                  {manager.remarks && (
                    <div className="mt-2 p-2 bg-background rounded">
                      <p className="text-xs italic max-w-2xl wrap-break-word">
                        "{manager.remarks}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {canTakeAction ? (
        <div className="p-4 flex gap-4">
          <Button
            className="flex-1"
            onClick={() => openModal("approve")}
            disabled={actionLoading}
          >
            <CircleCheckBig />
            Approve
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => openModal("reject")}
            disabled={actionLoading}
          >
            <CircleX />
            Reject
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => openModal("recommend")}
            disabled={actionLoading}
          >
            <TrendingUp />
            Recommend
          </Button>
        </div>
      ) : (
        <></>
      )}

      <LeaveActionModal
        open={modalOpen}
        action={leaveAction}
        initialRemark=""
        submitting={actionLoading}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default UserLeaveRequest;
