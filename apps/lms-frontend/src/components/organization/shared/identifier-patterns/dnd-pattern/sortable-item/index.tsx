import React from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pen, X } from "lucide-react";
import { FIXED_TOKEN_VALUES } from "@/components/organization/organization.types";

const isEditableToken = (value: string) => !FIXED_TOKEN_VALUES.has(value);

interface IProps {
  token: { id: string; value: string };
  index: number;
  onRemove: (id: string) => void;
  onEditRequest: (id: string) => void;
}

const SortableItem = ({ token, index, onRemove, onEditRequest }: IProps) => {
  const { ref, isDragging } = useSortable({
    id: token.id,
    index,
  });
  const canEdit = isEditableToken(token.value);

  return (
    <div
      ref={ref}
      className={cn(
        isDragging && "opacity-50",
        "cursor-grab select-none border text-sm font-medium py-1 pl-3 pr-1 rounded-sm bg-card flex items-center",
      )}
    >
      {token.value}
      <div className="ml-2">
        {canEdit && (
          <Button
            size="icon-xs"
            variant="ghost"
            type="button"
            onClick={() => onEditRequest(token.id)}
          >
            <Pen />
          </Button>
        )}
        <Button
          size="icon-xs"
          variant="ghost"
          type="button"
          onClick={() => onRemove(token.id)}
        >
          <X />
        </Button>
      </div>
    </div>
  );
};

export default SortableItem;
