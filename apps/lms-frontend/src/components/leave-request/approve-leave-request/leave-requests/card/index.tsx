"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBadge } from "@/utils/get-badge";
import { Calendar, Dot } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const UserCard = ({ leaveRequest }: any) => {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const isSelected = uuid === leaveRequest.uuid;

  const handleClick = async (leave_request_uuid: string) => {
    if (uuid === leave_request_uuid) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("uuid", leave_request_uuid);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <button
      key={leaveRequest.uuid}
      onClick={() => handleClick(leaveRequest.uuid)}
      className={`w-full p-4 border-b border-border flex gap-2 transition-colors duration-200 cursor-pointer ${
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
          {getBadge(leaveRequest.status, leaveRequest.status)}
        </div>
        <p className="text-xs text-muted-foreground text-left">
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
    </button>
  );
};

export default UserCard;
