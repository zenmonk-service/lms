import { Managers } from "@/features/leave/leave.types";
import { cn } from "@/lib/utils";
import { getBadge } from "@/utils/badge/get-badge";
import { getLeaveIcon } from "@/utils/icon";
import { UsersRound } from "lucide-react";

export function ManagementDecision({ managers }: { managers: Managers[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <UsersRound size={12} />
        Management decision
        {managers.length > 0 && (
          <span className="text-muted-foreground/70">({managers.length})</span>
        )}
      </p>

      <div>
        {managers.map((manager, index) => {
          const isLast = index === managers.length - 1;

          return (
            <div className="flex gap-3" key={manager.user.user_id}>
              <div className="flex flex-col items-center">
                <div className="shrink-0">
                  {getLeaveIcon(manager.status_changed_to)}
                </div>
                {!isLast && (
                  <div className="my-1 w-0.5 flex-1 rounded-full bg-muted-foreground/30" />
                )}
              </div>

              <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold wrap-break-word">
                      {manager.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground wrap-break-word">
                      {manager.user.role.name}
                    </p>
                  </div>
                  {manager.status_changed_to && (
                    <div className="shrink-0">
                      {getBadge(manager.status_changed_to)}
                    </div>
                  )}
                </div>

                {manager.remarks ? (
                  <div className="mt-2 rounded-lg border border-border bg-accent/20 p-3">
                    <p className="text-xs italic wrap-break-word">
                      "{manager.remarks}"
                    </p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[10px] italic text-muted-foreground">
                    No remark provided
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
