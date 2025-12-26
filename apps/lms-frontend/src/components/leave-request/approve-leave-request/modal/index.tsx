"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
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
    } catch (err) {
      console.error("LeaveActionModal onConfirm error:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please add remarks (optional). This will be saved for this manager's
          decision.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={onClose}
              type="button"
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
