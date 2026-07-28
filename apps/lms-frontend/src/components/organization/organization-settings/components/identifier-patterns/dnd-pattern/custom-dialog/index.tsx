"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DialogTarget = "new" | { id: string; value: string } | null;

interface IProps {
  target: DialogTarget;
  onClose: () => void;
  onAdd: (value: string) => void;
  onEdit: (id: string, value: string) => void;
}

const CustomTokenDialog = ({ target, onClose, onAdd, onEdit }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = target !== null && target !== "new";

  const handleSave = () => {
    const trimmed = inputRef.current?.value.trim() ?? "";
    if (!trimmed) return;

    if (isEditing) onEdit(target.id, trimmed);
    else onAdd(trimmed);

    onClose();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit token" : "Add custom text"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the text for this token."
              : "Enter a custom prefix or text to add to the pattern."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="token-value">Value</Label>
          <Input
            key={isEditing ? target.id : "new"}
            id="token-value"
            ref={inputRef}
            defaultValue={isEditing ? target.value : ""}
            placeholder="e.g. EMP-"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>

        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            {isEditing ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTokenDialog;