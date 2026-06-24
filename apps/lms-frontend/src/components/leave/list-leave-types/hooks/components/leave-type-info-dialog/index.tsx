import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LeaveType } from "@/features/leave/leave.types";
import { getPolicyMode } from "@/utils/leave-type";

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-2 border-b px-3 py-2 text-xs last:border-b-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const GroupSection = ({
  label,
  items,
}: {
  label: string;
  items: { id: string; name: string }[];
}) => {
  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 border-b px-3 py-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">({items.length})</span>
      </div>
      <div className="border-b px-3 py-2 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge variant="outline" className="rounded-sm" key={item.id}>
              {item.name}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
};

export const LeaveTypeInfoDialog = ({ leave }: { leave: LeaveType }) => {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <Info size={16} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">View details</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Leave Type Details</DialogTitle>
        </DialogHeader>
        <div className="mt-3 overflow-hidden rounded-md border alternate-bg">
          <DetailRow label="Name" value={leave.name} />
          {leave.description && (
            <DetailRow
              label="Description"
              value={
                <p className="whitespace-pre-wrap" style={{ wordBreak: "break-word" }}>
                  {leave.description}
                </p>
              }
            />
          )}
          <DetailRow label="Code" value={<span className="font-mono">{leave.code?.toUpperCase?.()}</span>} />

          <GroupSection
            label="Applicable Roles"
            items={leave.roles.map((r) => ({ id: r.uuid, name: r.name }))}
          />
          <GroupSection
            label="Applicable Employees"
            items={leave.users.map((u) => ({ id: u.user_id, name: u.name }))}
          />

          <DetailRow
            label="Accrual"
            value={<span className="capitalize">{leave.accrual?.period === "no_accrual" ? "No Accrual" : leave.accrual?.period}</span>}
          />
          <DetailRow label="Leave Count" value={`${leave.accrual?.leave_count} days`} />
          <DetailRow label="Policy Mode" value={getPolicyMode(leave)} />
          <DetailRow
            label="Max Consecutive Days"
            value={
              leave.max_consecutive_days !== null && leave.max_consecutive_days !== undefined
                ? `${leave.max_consecutive_days} days`
                : "Not limited"
            }
          />
          <DetailRow label="Negative Balance" value={leave.allow_negative_leaves ? "Allowed" : "Restricted"} />
          <DetailRow label="Carry Forward" value={leave.carry_forward ? "Allowed" : "Restricted"} />
        </div>
      </DialogContent>
    </Dialog>
  );
};