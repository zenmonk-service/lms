"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBadge } from "@/utils/badge/get-badge";
import { Calendar } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface IProps {
  leaveRequest: any;
}

const UserLeaveRequest = ({ leaveRequest }: IProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const isSelected = uuid === leaveRequest.uuid;

  const handleClick = async (leave_request_uuid: string) => {
    if (uuid === leave_request_uuid) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("uuid", leave_request_uuid);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <button
      onClick={() => handleClick(leaveRequest.uuid)}
      className={`w-full min-w-0 p-4 border-b border-border last:border-b-0 @4xl/panel:last:border-b flex gap-2 transition-colors duration-200 cursor-pointer ${
        isSelected
          ? "bg-accent/40 border-b-2! border-b-primary"
          : "hover:bg-muted/50"
      }`}
    >
      <Avatar className="shrink-0">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0">
          <div className="min-w-0 flex-1 flex flex-col items-start">
            <p className="w-full truncate text-sm">{leaveRequest.user.name}</p>

            <p className="max-w-full truncate text-xs text-muted-foreground">
              {leaveRequest.user.role.name}
            </p>
          </div>

          <div className="shrink-0 h-fit">
            {getBadge(leaveRequest.status, leaveRequest.status)}
          </div>
        </div>

        <div className="flex min-w-0 items-center space-x-1">
          <Calendar size={11} className="shrink-0 text-muted-foreground" />

          <p className="min-w-0 truncate text-[10px] tracking-tighter text-muted-foreground">
            {leaveRequest.start_date} - {leaveRequest.end_date}
          </p>
        </div>
      </div>
    </button>
  );
};

export default UserLeaveRequest;
