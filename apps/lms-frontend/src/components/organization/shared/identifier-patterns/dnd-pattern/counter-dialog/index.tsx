"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CounterDialogTarget = "new" | { id: string; base: number } | null;

interface IProps {
  target: CounterDialogTarget;
  onClose: () => void;
  onAdd: (base: number) => void;
  onEdit: (id: string, base: number) => void;
}

// Comfortably past any realistic starting number, but well short of where
// a number stops round-tripping through toString() as plain digits —
// beyond that the token stores stringifies to scientific notation (e.g.
// "1.4934444444444445e+105"), which no longer matches COUNTER_TOKEN_REGEX,
// so the token silently stops being recognized as a counter at all.
const MAX_COUNTER_BASE = 999_999_999;

const counterBaseSchema = z
  .number({ error: "Enter a starting number" })
  // Not .int(): it checks Number.isSafeInteger(), which fails for a value
  // this large with a misleading "Enter a whole number" message even
  // though the input genuinely was whole — just too big to represent
  // precisely as a float. .max() below is what actually matters here, and
  // parseInt can't produce a fractional result in the first place (it
  // truncates at the first non-digit character), so .int() was never
  // protecting against real decimal input either.
  .min(0, "Starting number cannot be negative")
  .max(
    MAX_COUNTER_BASE,
    `Starting number must be ${MAX_COUNTER_BASE.toLocaleString()} or fewer`,
  );

const CounterTokenDialog = ({ target, onClose, onAdd, onEdit }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = target !== null && target !== "new";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [target]);

  const handleSave = () => {
    const raw = inputRef.current?.value.trim() ?? "";
    if (!raw) {
      setError("Starting number is required");
      return;
    }

    const result = counterBaseSchema.safeParse(Number.parseInt(raw, 10));
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid starting number");
      return;
    }

    setError(null);
    const base = result.data;

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

        <Field className="gap-1">
          <FieldLabel htmlFor="counter-base">Starting number</FieldLabel>
          <Input
            key={isEditing ? target.id : "new"}
            id="counter-base"
            ref={inputRef}
            type="number"
            min={0}
            max={MAX_COUNTER_BASE}
            defaultValue={isEditing ? target.base : 1}
            placeholder="e.g. 1000"
            autoFocus
            aria-invalid={!!error}
            onChange={() => setError(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          <FieldError errors={[error ? { message: error } : undefined]} />
        </Field>

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
