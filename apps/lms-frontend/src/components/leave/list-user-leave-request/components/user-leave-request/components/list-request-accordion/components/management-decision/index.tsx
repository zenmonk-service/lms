import { Managers } from "@/features/leave/leave.types";
import { getBadge } from "@/utils/badge/get-badge";
import { getLeaveIcon } from "@/utils/icon";

export function ManagementDecision({ managers }: { managers: Managers[] }) {
  return (
    <div>
      <p className="font-semibold text-xs text-muted-foreground">
        Management decision
      </p>
      <div className="relative">
        <div className="absolute left-2 top-4.25 bottom-1 w-[1.5px] bg-muted" />
        {managers.map((manager) => (
          <div className="mt-4" key={manager.user.user_id}>
            <div className="flex gap-3">
              {getLeaveIcon(manager.status_changed_to)}
              <div className="flex flex-col">
                <p className="font-semibold wrap-break-word">
                  {manager.user.name}
                </p>
                <p className="text-[10px] text-muted-foreground wrap-break-word">
                  {manager.user.role.name}
                </p>
              </div>
              <div className="ml-auto">
                {manager.status_changed_to
                  ? getBadge(manager.status_changed_to)
                  : null}
              </div>
            </div>
            <div className="ml-7.5">
              {manager.remarks ? (
                <div className="p-3 bg-accent/20 border border-border rounded-lg shadow-sm mt-2">
                  <p className="italic text-xs wrap-break-word">
                    "{manager.remarks}"
                  </p>
                </div>
              ) : (
                <p className="mt-2.5 text-[10px] italic text-muted-foreground">
                  No remark provided
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
