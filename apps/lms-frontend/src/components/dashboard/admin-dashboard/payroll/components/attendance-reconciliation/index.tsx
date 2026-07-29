import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store";
import { formatDate } from "@/utils/format-date";
import {
  ATTENDANCE_STATUS_META,
  MANUALLY_ASSIGNABLE_STATUSES,
} from "@/utils/attendance-status";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { getBadge } from "@/utils/badge/get-badge";
import { createMissingAttendancesAction } from "@/features/attendances/create-missing-attendances/create-missing-attendances.action";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { ReconciliationFormValues, ReconciliationSchema } from "../../payroll.types";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => Promise<void>;
}

const AttendanceReconciliation = ({
  open,
  onOpenChange,
  onResolved,
}: IProps) => {
  const dispatch = useAppDispatch();
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);
  const { missingAttendanceDates } = useAppSelector((state) => state.attendancesSlice);

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReconciliationFormValues>({
    resolver: zodResolver(ReconciliationSchema),
    values: {
      records: missingAttendanceDates.map((date) => ({
        date,
        status: "" as AttendanceStatus,
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "records",
  });

  const handleMarkAllAs = (status: AttendanceStatus) => {
    fields.forEach((_, index) => {
      setValue(`records.${index}.status`, status, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const onSubmit = async (values: ReconciliationFormValues) => {
    setIsLoading(true);
    const res = await dispatch(createMissingAttendancesAction({ org_uuid, records: values.records }));
    if (createMissingAttendancesAction.fulfilled.match(res)) {
      await onResolved();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance Reconciliation Required</DialogTitle>
          <DialogDescription>
            We found {missingAttendanceDates.length} days with unsubmitted
            attendance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Mark all as
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MANUALLY_ASSIGNABLE_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleMarkAllAs(status)}
                >
                  {ATTENDANCE_STATUS_META[status].icon}
                  <p className="ml-2">{ATTENDANCE_STATUS_META[status].label}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative max-h-100 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background h-10 pointer-events-none">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">
                    {formatDate(field.date)}
                  </TableCell>

                  <Controller
                    control={control}
                    name={`records.${index}.status`}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <TableCell className="text-center">
                          {value ? (
                            getBadge(value, value.replaceAll("_", " "), undefined)
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost">...</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-50" align="start">
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  Upload Excel
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    Attendance Status
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {MANUALLY_ASSIGNABLE_STATUSES.map(
                                        (status) => (
                                          <DropdownMenuItem
                                            key={status}
                                            disabled={status === value}
                                            onClick={() => onChange(status)}
                                          >
                                            {
                                              ATTENDANCE_STATUS_META[status]
                                                .icon
                                            }
                                            <p className="ml-2">
                                              {
                                                ATTENDANCE_STATUS_META[status]
                                                  .label
                                              }
                                            </p>
                                          </DropdownMenuItem>
                                        ),
                                      )}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </>
                    )}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex-col items-end gap-2 sm:flex-col">
          {errors.records?.root?.message && (
            <p className="text-sm text-destructive">
              {errors.records.root.message}
            </p>
          )}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? <LoaderCircle className="animate-spin" /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceReconciliation;