"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/has-permission";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import Title from "@/shared/typography/title";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";
import { deleteUserLeaveRequestAction } from "@/features/leave/delete-user-leave-request/delete-user-leave-request.action";
import { Row } from "@/features/leave/leave.types";
import UserLeaveRequest from "./components/user-leave-request";
import MakeLeaveRequest from "./components/make-leave-request";
import { LeaveRequestModal } from "../shared/leave-request-modal";
import { cn } from "@/lib/utils";

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
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );

  const dispatch = useAppDispatch();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedLeaveRequestUuid, setSelectedLeaveRequestUuid] =
    useState<string>("");
  const [data, setData] = useState<Row>();
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onEdit = (row: Row) => {
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
          params: { ...leaveRequestFilter },
        }),
      );
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirm = async () => {
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
  };

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
    <div className="flex flex-col items-center w-full">
      <div
        className={cn(
          isView
            ? "px-4 mt-4 w-full"
            : "w-11/12 min-[1400px]:w-3/4 py-6 sm:p-6",
        )}
      >
        <Title
          title={{ text: "Leave Requests" }}
          description={{ text: "Manage your leave applications and track manager feedback and recommendations." }}
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
        handleConfirm={handleConfirm}
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
