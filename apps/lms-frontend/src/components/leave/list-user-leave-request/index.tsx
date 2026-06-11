"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/haspermissios";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import Title from "@/shared/typography/title";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";
import { deleteUserLeaveRequestAction } from "@/features/leave/delete-user-leave-request/delete-user-leave-request.action";
import { LeaveRequestStatus } from "@/features/leave/leave.types";

import UserLeaveRequest from "./components/user-leave-request";
import MakeLeaveRequest from "./components/make-leave-request";
import { LeaveRequestModal } from "../shared/leave-request-modal";

interface LeaveRequestStatusChangedBy {
  user_id: string;
  name: string;
  email: string;
}

export type LeaveRequestType = {
  uuid: string;
  id?: number;
  user?: {
    uuid?: string;
    name?: string;
    email?: string;
  };
  leave_type?: {
    uuid?: string;
    name?: string;
    code?: string;
  };
  start_date?: string;
  end_date?: string | null;
  type?: string;
  range?: string;
  leave_duration?: number | null;
  reason?: string | null;
  status?: LeaveRequestStatus;
  status_changed_by?: LeaveRequestStatusChangedBy[] | null;
  created_at?: string;
  updated_at?: string;
};

const LeaveRequest = ({
  isView = false,
  userUUId,
}: {
  isView?: boolean;
  userUUId?: string;
}) => {
  const {
    userLeaveRequests,
    leaveRequestsLoading,
    leaveRequestsMoreLoading,
    leaveRequestFilter,
  } = useAppSelector((state) => state.leaveSlice);
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);

  const dispatch = useAppDispatch();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedLeaveRequestUuid, setSelectedLeaveRequestUuid] = useState<string>("");
  const [data, setData] = useState<LeaveRequestType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onEdit = (row: LeaveRequestType) => {
    setData(row);
    setModalOpen(true);
  };

  const onDelete = (leave_request_uuid: string) => {
    setSelectedLeaveRequestUuid(leave_request_uuid);
    setConfirmationOpen(true);
  };

  async function fetchUserLeaves() {
    const isFirstPageLoad = leaveRequestFilter?.pagination?.page === 1;
    setIsLoading(isFirstPageLoad);

    try {
      await dispatch(
        listUserLeaveRequestsAction({ 
          org_uuid: currentOrganizationUuid,
          user_uuid: userUUId || currentUser?.user_id,
          params: { ...leaveRequestFilter, ...leaveRequestFilter?.pagination },
        }),
      );
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUserLeaves();
  }, [
    leaveRequestFilter?.pagination,
    leaveRequestFilter?.status,
    leaveRequestFilter?.date_range,
    leaveRequestFilter?.date,
    leaveRequestFilter?.managers,
    leaveRequestFilter?.leave_type_uuid,
  ]);

  return (
    <div className={isView ? "" : "flex flex-col items-center"}>
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <Title
          title={{
            text: "Leave Requests",
            className: "",
          }}
          description={{
            text: "Manage your leave applications and track manager feedback and recommendations.",
            className: "",
          }}
          className=""
          button={
            hasPermissions(
              "leave_request_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) &&
            !isView && <MakeLeaveRequest />
          }
        />

        {hasPermissions(
          "leave_request_management",
          "read",
          currentUserRolePermissions,
          currentUser?.email,
        ) && (
          <UserLeaveRequest
            isLoading={isLoading}
            isLoadingMore={leaveRequestsMoreLoading}
            userLeaveRequests={userLeaveRequests}
            isView={isView}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </div>

      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        description="This action cannot be undone. This will permanently delete this leave request."
        handleConfirm={async () => {
          await dispatch(
            deleteUserLeaveRequestAction({
              org_uuid: currentOrganizationUuid,
              user_uuid: currentUser?.user_id,
              leave_request_uuid: selectedLeaveRequestUuid,
            }),
          );
          await dispatch(
            listUserLeaveRequestsAction({
              org_uuid: currentOrganizationUuid,
              user_uuid: currentUser?.user_id,
              params: leaveRequestFilter,
            }),
          );
        }}
        isLoading={leaveRequestsLoading}
      />

      <LeaveRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
        leave_request_uuid={data?.uuid}
      />
    </div>
  );
};

export default LeaveRequest;
