"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeaveRequestStatus } from "@/features/leave/leave.types";
import { useAppDispatch, useAppSelector } from "@/store";
import { ArrowLeft, Dot, Paperclip } from "lucide-react";
import React, { useEffect, useState } from "react";

import { SkeletonUserLeaveRequest } from "./components/skeleton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { approveLeaveRequestAction } from "@/features/leave/approve-leave-request/approve-leave-request.action";
import { rejectLeaveRequestAction } from "@/features/leave/reject-leave-request/reject-leave-request.action";
import { recommendLeaveRequestAction } from "@/features/leave/recommend-leave-request/recommend-leave-request.action";
import { getUserLeaveRequestAction } from "@/features/leave/get-user-leave-request/get-user-leave-request.action";
import LeaveActionModal from "./components/leave-action-modal";
import { listLeaveRequestsAction } from "@/features/leave/list-leave-requests/list-leave-request.action";
import { ActionButtons } from "./components/action-button";
import { LeaveAction } from "@/components/leave/leave.types";
import { LeaveDetailsCard } from "./components/leave-details-card";
import { LeaveBalanceCard } from "./components/leave-balance-card";
import { ReasonCard } from "./components/reason-card";
import { AttachmentsCard } from "./components/attachement-card";
import { ManagersCard } from "./components/manager-card";

const UserLeaveRequestDetails = ({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { selectedLeaveRequest, isSelectedLeaveRequestLoading } =
    useAppSelector((s) => s.leaveSlice);
  const canUpdateLeaveRequest = selectedLeaveRequest?.managers.some(
    (manager) => manager.user.user_id == currentUser.user_id,
  );

  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [leaveAction, setLeaveAction] = useState<LeaveAction>(null);

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

  const goBackToQueue = () => router.push(pathname);

  const handleModalConfirm = async (remarkText: string) => {
    if (!selectedLeaveRequest || !leaveAction || !currentOrganization.uuid)
      return;

    const payloadWithOrg = {
      leave_request_uuid: selectedLeaveRequest.uuid,
      manager_uuid: currentUser?.user_id,
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
        params: {
          manager_uuid: isAdmin ? undefined : currentUser.user_id,
          page: 1,
          limit: 10,
          isInfiniteScroll: true,
        },
      };
      await dispatch(listLeaveRequestsAction(payload));
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

  const status_changed_by_you = selectedLeaveRequest.status_changed_by?.some(
    (user) => user.user_id === currentUser?.user_id,
  );

  const isPending = selectedLeaveRequest.status === LeaveRequestStatus.PENDING;
  const isRecommended =
    selectedLeaveRequest.status === LeaveRequestStatus.RECOMMENDED;
  const canTakeAction = !status_changed_by_you && (isPending || isRecommended);

  return (
    <div className="@container flex flex-col h-full">
      <div className="flex gap-2 p-4 border-b border-border bg-primary/10">
        <Avatar className="w-12 h-12 shrink-0">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 min-w-0">
          <div>
            <h2 className="text-lg font-semibold truncate">
              {selectedLeaveRequest.user.name}
            </h2>
            <div className="flex flex-col @sm:flex-row gap-1 items-start @sm:items-center">
              <p className="text-xs text-muted-foreground truncate">
                {selectedLeaveRequest.user.role.name}
              </p>
              <Dot className="hidden @sm:block" size={12} strokeWidth={7} />
              <p className="text-xs truncate text-muted-foreground">
                {selectedLeaveRequest.user.email}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex @2xl/panel:hidden ml-auto"
          onClick={goBackToQueue}
        >
          <ArrowLeft size={18} /> Back to Queue
        </Button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto border-b border-border">
        <div className="flex flex-col @xl:flex-row gap-4">
          <LeaveDetailsCard leaveRequest={selectedLeaveRequest} />
          <LeaveBalanceCard leaveRequest={selectedLeaveRequest} />
        </div>

        <ReasonCard />

        {selectedLeaveRequest.documents &&
          selectedLeaveRequest.documents.length > 0 && (
            <div className="bg-background rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Paperclip size={16} />
                <p className="font-semibold text-sm">Attachments</p>
              </div>
              {selectedLeaveRequest.documents.map((doc) => (
                <AttachmentsCard key={doc.uuid} document={doc.attachment} />
              ))}
            </div>
          )}

        <ManagersCard managers={selectedLeaveRequest.managers} />
      </div>

      {canTakeAction && canUpdateLeaveRequest && (
        <ActionButtons onAction={openModal} disabled={actionLoading} />
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

export default UserLeaveRequestDetails;
