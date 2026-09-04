import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SquareUser } from "lucide-react";
import { getBadge } from "@/utils/badge/get-badge";
import { Managers } from "@/features/leave/leave.types";

export function ManagersCard({ managers }: { managers: Managers[] }) {
  return (
    <div className="bg-background rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <SquareUser size={16} />
        <p className="font-semibold text-sm">Manager</p>
      </div>
      <div className="flex flex-col bg-card gap-2 mt-2 border border-border rounded">
        {managers.map((manager, index) => (
          <div key={index} className="p-3 border-b border-border last:border-0 flex gap-2">
            <Avatar className="shrink-0">
              <AvatarImage src={manager.user.image!} alt={manager.user.name} />
              <AvatarFallback>{manager.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{manager.user.name}</p>
                  <p className="text-xs text-background-foreground truncate">{manager.user.email}</p>
                </div>
                {manager.status_changed_to &&
                  getBadge(
                    manager.status_changed_to,
                    manager.status_changed_to,
                    undefined,
                    undefined,
                    "h-fit shrink-0",
                  )}
              </div>
              {manager.remarks && (
                <div className="mt-2 p-2 bg-background rounded">
                  <p className="text-xs italic wrap-break-word">"{manager.remarks}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}