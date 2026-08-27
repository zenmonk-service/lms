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

type CounterDialogTarget = "new" | { id: string; base: number } | null;

interface IProps {
  target: CounterDialogTarget;
  onClose: () => void;
  onAdd: (base: number) => void;
  onEdit: (id: string, base: number) => void;
}

const CounterTokenDialog = ({ target, onClose, onAdd, onEdit }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = target !== null && target !== "new";

  const handleSave = () => {
    const raw = inputRef.current?.value.trim() ?? "";
    const base = Number.parseInt(raw, 10);
    if (!raw || Number.isNaN(base) || base < 0) return;

    if (isEditing) onEdit(target.id, base);
    else onAdd(base);

    onClose();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit counter" : "Add counter"}
          </DialogTitle>
          <DialogDescription>
            Set the starting number. Each new ID increments from here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="counter-base">Starting number</Label>
          <Input
            key={isEditing ? target.id : "new"}
            id="counter-base"
            ref={inputRef}
            type="number"
            min={0}
            defaultValue={isEditing ? target.base : 1}
            placeholder="e.g. 1000"
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
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            {isEditing ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CounterTokenDialog;
