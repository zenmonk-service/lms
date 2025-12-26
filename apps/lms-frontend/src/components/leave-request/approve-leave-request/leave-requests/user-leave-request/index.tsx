"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  AlertCircleIcon,
  ArrowDownToLine,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckIcon,
  CircleCheckBig,
  CircleX,
  ClockIcon,
  Dot,
  File,
  FileText,
  LoaderCircle,
  Mail,
  Paperclip,
  Phone,
  SquareUser,
  TrendingUp,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import React, { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import LeaveActionModal from "../../modal";
import { toastError } from "@/shared/toast/toast-error";

type LeaveAction = "approve" | "reject" | "recommend" | null;

const UserLeaveRequest = () => {
  const dispatch = useAppDispatch();
  const {
    selectedLeaveRequest,
    isSelectedLeaveRequestLoading,
    selectedLeaveRequestDetails,
  } = useAppSelector((s) => s.leaveRequestSlice);
  const { currentUser } = useAppSelector(
    (state) => state.userSlice
  );
  const { currentOrganization } = useAppSelector(state => state.organizationsSlice);
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveAction, setLeaveAction] = useState<LeaveAction>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
        const payload = { ...payloadWithOrg, status_changed_to };
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
      closeModal();
      await dispatch(approvableLeaveRequestsAction({}));
      await dispatch(
        getUserLeaveRequestAction({
          org_uuid: currentOrganization.uuid,
          user_uuid: currentUser?.user_id,
          leave_request_uuid: selectedLeaveRequest.uuid,
        })
      );
    } catch (err) {
    } finally {
      setActionLoading(false);
    }
  };

  if (isSelectedLeaveRequestLoading) return <SkeletonUserLeaveRequest />;

  if (!selectedLeaveRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f9fafb]">
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
      (user) => user.user_id === currentUser?.user_id
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
              {selectedLeaveRequestDetails?.user?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedLeaveRequestDetails?.user?.role.name}
            </p>
          </div>
          <div className="flex text-muted-foreground gap-3">
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <p className="text-xs">
                {selectedLeaveRequestDetails?.user?.email}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <p className="text-xs">+91 78YYXXXZZZ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white flex-1 flex flex-col gap-4 overflow-y-auto border-b border-border">
        <div className="flex gap-4">
          <div className="bg-[#f9fafb] rounded-lg border border-border p-3 flex-1">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-orange-500" />
              <p className="font-semibold text-sm">Leave Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-muted-foreground">Name:</p>
                <p className="text-xs text-muted-foreground">Start Date:</p>
                <p className="text-xs text-muted-foreground">End Date:</p>
                <p className="text-xs text-muted-foreground">Type:</p>
                <p className="text-xs text-muted-foreground">Range:</p>
                <p className="text-xs text-muted-foreground">Duration:</p>
                <p className="text-xs text-muted-foreground">Submitted:</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest?.leave_type.name}
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest.start_date}
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest?.end_date}
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest?.type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest?.range
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest?.leave_duration} days
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest?.created_at.split("T")[0]}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#f9fafb] rounded-lg border border-border p-3 flex-1">
            <div className="flex items-center gap-2">
              <ChartNoAxesColumnIncreasing
                size={16}
                className="text-orange-500"
              />
              <p className="font-semibold text-sm">Leave Balance</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-muted-foreground">Total:</p>
                <p className="text-xs text-muted-foreground">Used:</p>
                <p className="text-xs text-muted-foreground">Remaining:</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs font-medium text-end">
                  {
                    selectedLeaveRequest.leave_type.leave_balances[0]
                      .leaves_allocated
                  }{" "}
                  days
                </p>
                <p className="text-xs font-medium text-end">
                  {selectedLeaveRequest.leave_type.leave_balances[0]
                    .leaves_allocated -
                    Number(
                      selectedLeaveRequest.leave_type.leave_balances[0].balance
                    )}{" "}
                </p>
                <p className="text-xs font-medium text-end text-green-400">
                  {selectedLeaveRequest.leave_type.leave_balances[0].balance}{" "}
                  days
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                className="[&>*]:bg-orange-500"
                value={
                  (Number(
                    selectedLeaveRequest.leave_type.leave_balances[0].balance
                  ) /
                    selectedLeaveRequest.leave_type.leave_balances[0]
                      .leaves_allocated) *
                  100
                }
                max={100}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f9fafb] rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-orange-500" />
            <p className="font-semibold text-sm">Reason for Leave</p>
          </div>
          <p className="text-xs text-foreground leading-relaxed mt-2">
            {selectedLeaveRequest?.reason || "No reason provided."}
          </p>
        </div>

        <div className="bg-[#f9fafb] rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <Paperclip size={16} className="text-orange-500" />
            <p className="font-semibold text-sm">Attachments</p>
          </div>
          <div className="p-4 bg-white border-1 mt-4 rounded-sm">
            <div className="flex items-center gap-2">
              <File size={18} />
              <div className="flex flex-col">
                <p className="text-xs">medical_certificate.pdf</p>
                <div className="flex items-center">
                  <p className="text-xs text-muted-foreground">256 KB</p>
                  <Dot className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">PDF</p>
                </div>
              </div>
              <div className="justify-end flex flex-1">
                <ArrowDownToLine size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f9fafb] rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <SquareUser size={16} className="text-orange-500" />
            <p className="font-semibold text-sm">Manager</p>
          </div>
          <div className="flex flex-col bg-white gap-2 mt-2 border border-border rounded">
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
                      <p className="text-xs text-muted-foreground">
                        {manager.user.email}
                      </p>
                    </div>
                    {manager.status_changed_to && (
                      <Badge
                        variant={
                          manager.status_changed_to ===
                          LeaveRequestStatus.APPROVED
                            ? "success"
                            : manager.status_changed_to ===
                              LeaveRequestStatus.REJECTED
                            ? "destructive"
                            : manager.status_changed_to ===
                              LeaveRequestStatus.PENDING
                            ? "secondary"
                            : manager.status_changed_to ===
                              LeaveRequestStatus.CANCELLED
                            ? "outline"
                            : "default"
                        }
                        className="rounded-sm max-h-[21.79px]"
                      >
                        {manager.status_changed_to ===
                          LeaveRequestStatus.PENDING && <ClockIcon />}
                        {manager.status_changed_to ===
                          LeaveRequestStatus.REJECTED && <XIcon />}
                        {manager.status_changed_to ===
                          LeaveRequestStatus.APPROVED && <CheckIcon />}
                        {manager.status_changed_to ===
                          LeaveRequestStatus.RECOMMENDED && <TrendingUpIcon />}
                        {manager.status_changed_to ===
                          LeaveRequestStatus.CANCELLED && <AlertCircleIcon />}
                        {manager.status_changed_to}
                      </Badge>
                    )}
                  </div>
                  {manager.remarks && (
                    <div className="mt-2 p-2 bg-[#f1f3f5] rounded">
                      <p className="text-xs italic">"{manager.remarks}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {canTakeAction ? (
        <div className="p-4 bg-white flex gap-4">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-500"
            onClick={() => openModal("approve")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <CircleCheckBig />
            )}
            Approve
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => openModal("reject")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <CircleX />
            )}
            Reject
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => openModal("recommend")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <TrendingUp />
            )}
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
