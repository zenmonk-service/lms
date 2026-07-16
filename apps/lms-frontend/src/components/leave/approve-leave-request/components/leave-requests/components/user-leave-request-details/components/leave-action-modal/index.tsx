"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type LeaveAction = "approve" | "reject" | "recommend" | null;

export interface LeaveActionModalProps {
  open: boolean;
  action: LeaveAction;
  initialRemark?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => Promise<void> | void;
}

export default function LeaveActionModal({
  open,
  action,
  initialRemark = "",
  submitting = false,
  onClose,
  onConfirm,
}: LeaveActionModalProps) {
  const [localLoading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{ remark: string }>({
    defaultValues: {
      remark: initialRemark,
    },
  });

  const remarkValue = watch("remark");

  useEffect(() => {
    if (open) {
      reset({ remark: initialRemark });
    }
  }, [open, initialRemark, action, reset]);

  if (!open || !action) return null;

  const title =
    action === "approve"
      ? "Approve Leave Request"
      : action === "reject"
        ? "Reject Leave Request"
        : "Recommend Leave Request";

  const buttonText =
    action === "approve"
      ? "Approve"
      : action === "reject"
        ? "Reject"
        : "Recommend";

  const isLoading = submitting || localLoading;

  const onSubmit = async (data: { remark: string }) => {
    try {
      setLocalLoading(true);
      await Promise.resolve(onConfirm(data.remark));
      onClose();
    } catch (err) {} 
    finally {
      setLocalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please add remarks (optional). This will be saved for this manager's
            decision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field className="gap-1">
            <InputGroup>
              <InputGroupTextarea
                {...register("remark")}
                id="remark"
                placeholder="Add your remarks here..."
                rows={4}
                className="min-h-20 resize-none"
                aria-invalid={!!errors.remark}
                maxLength={255}
              />

              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {remarkValue?.length || 0}/255 characters
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>

            {errors.remark && (
              <FieldError errors={[errors.remark]} className="text-xs" />
            )}
          </Field>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
