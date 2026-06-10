"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LeaveBalance } from "@/features/leave/leave.types";
import { useAppDispatch, useAppSelector } from "@/store";
import { allocateSpecialLeaveAction } from "@/features/leave/allocate-special-leave/allocate-special-leave.action";
import { listUserLeaveBalancesAction } from "@/features/leave/list-user-leave-balance/list-user-leave-balance.action";



const slaSchema = z.object({
  sla: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(1, "SLA must be a positive number")
  ),
});



type SlaFormValues = z.infer<typeof slaSchema>;

interface ProvideSlaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveBalance: LeaveBalance | null;
  userUUId?: string;
}

export function ProvideSlaModal({
  open,
  onOpenChange,
  leaveBalance,
  userUUId,
}: ProvideSlaModalProps) {
  const dispatch = useAppDispatch();
  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(slaSchema),
    defaultValues: {
      sla: 0,
    },
  });

  useEffect(() => {
    if (open && leaveBalance) {
      reset({
        sla: Number(leaveBalance.sla || 1),
      });
    }
  }, [open, leaveBalance, reset]);

  const onSubmit = async (data: SlaFormValues) => {
    if (!leaveBalance?.uuid) {
      toast.error("Leave balance UUID is missing");
      return;
    }
    if (!currentOrganizationUuid) {
      toast.error("Organization ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        allocateSpecialLeaveAction({
          org_uuid: currentOrganizationUuid,
          leave_balance_uuid: leaveBalance.uuid,
          sla: data.sla,
        }),
      ).unwrap();

      toast.success("SLA allocated successfully");

      // Reload leave balances
      dispatch(
        listUserLeaveBalancesAction({
          user_uuid: userUUId || currentUser?.user_id,
          org_uuid: currentOrganizationUuid,
          period: leaveBalance.period,
        }),
      );

      onOpenChange(false);
    } catch (error) {
      // Errors are already handled by action toastError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border border-border/80 dark:bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Provide SLA Allocation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Assign special leave allocation for{" "}
            <span className="font-semibold text-foreground">
              {leaveBalance?.leave_type?.name}
            </span>{" "}
            ({leaveBalance?.leave_type?.code}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Field>
            <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Special SLA Days
            </FieldLabel>
            <div className="relative">
              <Input
                type="number"
                step="any"
                placeholder="Enter SLA value (e.g. 5)"
                className="pr-10 dark:bg-input/10"
                disabled={isSubmitting}
                {...register("sla")}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-xs">
                Days
              </div>
            </div>
            <FieldError errors={[errors.sla]} />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Allocation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
