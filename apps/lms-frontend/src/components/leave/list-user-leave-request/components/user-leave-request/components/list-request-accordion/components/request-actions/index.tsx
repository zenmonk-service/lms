import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Row } from "@/features/leave/leave.types";
import { Edit, Trash2 } from "lucide-react";

interface IProps {
  leaveRequest: Row;
  onEdit?: (leaveRequest: Row) => void;
  onDelete?: (uuid: string) => void;
}

export function RequestActions({ leaveRequest, onEdit, onDelete }: IProps) {
  return (
    <div>
      <Separator className="mb-3 mt-1" />
      <div className="flex flex-wrap gap-3 justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete?.(leaveRequest.uuid)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          <span className="text-xs">Withdraw Request</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => onEdit?.(leaveRequest)}
        >
          <Edit className="w-4 h-4 mr-1" />
          <span className="text-xs">Modify Request</span>
        </Button>
      </div>
    </div>
  );
}
