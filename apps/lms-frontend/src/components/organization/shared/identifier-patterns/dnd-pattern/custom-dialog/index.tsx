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

// Tokens are short, concatenated building blocks for an employee ID (prefix,
// department code, etc.) — this is well above any realistic value, just
// enough to stop a pasted paragraph from blowing out the pattern layout.
const MAX_TOKEN_LENGTH = 20;

const CustomTokenDialog = ({ target, onClose, onAdd, onEdit }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = target !== null && target !== "new";

  const handleSave = () => {
    const trimmed = (inputRef.current?.value.trim() ?? "").slice(
      0,
      MAX_TOKEN_LENGTH,
    );
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
            maxLength={MAX_TOKEN_LENGTH}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Up to {MAX_TOKEN_LENGTH} characters.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
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