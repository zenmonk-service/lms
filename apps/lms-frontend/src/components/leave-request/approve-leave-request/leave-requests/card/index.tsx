"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getUserLeaveRequestAction } from "@/features/leave-requests/leave-requests.action";
import { setSelectedLeaveRequestDetails } from "@/features/leave-requests/leave-requests.slice";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  AlertCircleIcon,
  Calendar,
  CheckIcon,
  ClockIcon,
  Dot,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";

const UserCard = ({ leaveRequest }: any) => {
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { currentOrganization } = useAppSelector((s) => s.organizationsSlice);
  const { selectedLeaveRequest, selectedLeaveRequestDetails } = useAppSelector(
    (s) => s.leaveRequestSlice
  );
  const dispatch = useAppDispatch();

  const selectedUuid =
    selectedLeaveRequestDetails?.leave_uuid || selectedLeaveRequest?.uuid;
  const isSelected = selectedUuid === leaveRequest.uuid;

  const fetchLeaveRequest = async (leave_request_uuid: string) => {
    await dispatch(
      getUserLeaveRequestAction({
        org_uuid: currentOrganization.uuid,
        user_uuid: currentUser?.user_id,
        leave_request_uuid,
      })
    );
  };

  const handleClick = async (leave_request_uuid: string) => {
    dispatch(
      setSelectedLeaveRequestDetails({
        leave_uuid: leave_request_uuid,
        user: {
          name: leaveRequest.user.name,
          role: {
            name: leaveRequest.user.role.name,
          },
          email: leaveRequest.user.email,
        },
      })
    );
    await fetchLeaveRequest(leave_request_uuid);
  };

  return (
    <div
      key={leaveRequest.uuid}
      onClick={() => handleClick(leaveRequest.uuid)}
      className={`p-4 border-b border-border flex gap-2 transition-colors duration-200 cursor-pointer ${
        isSelected
          ? "bg-accent/40 border-b-2 border-b-primary"
          : "hover:bg-muted/50"
      }`}
    >
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="text-sm">{leaveRequest.user.name}</p>
          <Badge
            variant={
              leaveRequest.status === LeaveRequestStatus.APPROVED
                ? "success"
                : leaveRequest.status === LeaveRequestStatus.REJECTED
                  ? "destructive"
                  : leaveRequest.status === LeaveRequestStatus.PENDING
                    ? "secondary"
                    : leaveRequest.status === LeaveRequestStatus.CANCELLED
                      ? "outline"
                      : "default"
            }
            className="rounded-sm"
          >
            {leaveRequest.status === LeaveRequestStatus.PENDING && (
              <ClockIcon />
            )}
            {leaveRequest.status === LeaveRequestStatus.REJECTED && <XIcon />}
            {leaveRequest.status === LeaveRequestStatus.APPROVED && (
              <CheckIcon />
            )}
            {leaveRequest.status === LeaveRequestStatus.RECOMMENDED && (
              <TrendingUpIcon />
            )}
            {leaveRequest.status === LeaveRequestStatus.CANCELLED && (
              <AlertCircleIcon />
            )}
            {leaveRequest.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {leaveRequest.user.role.name}
        </p>
        <div className="flex items-center space-x-1 text-xs">
          <Calendar size={14} className="text-muted-foreground" />
          <span>
            {leaveRequest.start_date} - {leaveRequest.end_date}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <p className="text-xs text-muted-foreground">
              {leaveRequest.leave_duration} days
            </p>
            <Dot className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {leaveRequest.leave_type.name}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {leaveRequest.created_at.split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
