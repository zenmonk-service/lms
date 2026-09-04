import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { UpdateTimeForm } from "../attendance.type";
import { Button } from "@/components/ui/button";
import {
  AttendanceReportRow,
  AttendanceStatus,
} from "@/features/attendances/attendances.type";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import CustomSelect from "@/shared/select";
import { useAppDispatch, useAppSelector } from "@/store";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { LeaveRange } from "@/features/leave/leave.types";
interface IProps {
  employee: AttendanceReportRow | null;
  onSubmit: (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
    data: UpdateTimeForm,
  ) => void;
  isTimeModalOpen: boolean;
  setIsTimeModalOpen: (open: boolean) => void;
  form: ReturnType<typeof useForm<UpdateTimeForm>>;
}

const HALF_DAY_RANGES = [LeaveRange.FIRST_HALF, LeaveRange.SECOND_HALF];
const SHORT_LEAVE_RANGES = [
  LeaveRange.FIRST_QUARTER,
  LeaveRange.SECOND_QUARTER,
  LeaveRange.THIRD_QUARTER,
  LeaveRange.FOURTH_QUARTER,
];
const RANGE_LABELS: Record<string, string> = {
  [LeaveRange.FULL_DAY]: "Full Day",
  [LeaveRange.FIRST_HALF]: "First Half",
  [LeaveRange.SECOND_HALF]: "Second Half",
  [LeaveRange.FIRST_QUARTER]: "1st Quarter",
  [LeaveRange.SECOND_QUARTER]: "2nd Quarter",
  [LeaveRange.THIRD_QUARTER]: "3rd Quarter",
  [LeaveRange.FOURTH_QUARTER]: "4th Quarter",
};

export default function AttendanceUpdateDialog({
  employee,
  isTimeModalOpen,
  setIsTimeModalOpen,
  onSubmit,
  form,
}: IProps) {
  const dispatch = useAppDispatch();
  const { leaveTypes, leaveTypesLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );




  useEffect(() => {
    if (
      employee &&
      employee.attendances[0].status === AttendanceStatus.ON_LEAVE
    )
      dispatch(listLeaveTypesAction({ org_uuid }));
  }, [employee, org_uuid]);

  return (
    <Dialog open={isTimeModalOpen} onOpenChange={setIsTimeModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Attendance Time</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (!employee) return;
              if (employee.attendances[0].status === AttendanceStatus.ON_LEAVE)
                data.range = LeaveRange.FULL_DAY;

              onSubmit(employee, employee.attendances[0].status, data);
            })}
          >
            <div className="space-y-4">
              {employee &&
                employee.attendances[0].status !== AttendanceStatus.ABSENT &&
                employee.attendances[0].status !==
                  AttendanceStatus.ON_LEAVE && (
                  <>
                    <FormField
                      control={form.control}
                      name="check_in"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check In</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              value={field.value ?? ""}
                              onChange={(event) =>
                                field.onChange(event.target.value || null)
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              disabled={field.disabled}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="check_out"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Out</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              value={field.value ?? ""}
                              onChange={(event) =>
                                field.onChange(event.target.value || null)
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              disabled={field.disabled}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />{" "}
                  </>
                )}

              {employee &&
                employee.attendances[0].status ===
                  AttendanceStatus.ON_LEAVE && (
                  <FormField
                    control={form.control}
                    name="leave_type_uuid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type</FormLabel>
                        <FormControl>
                          <CustomSelect
                            label="Leave Type"
                            className="w-full"
                            data={leaveTypes?.filter((leaveType) => leaveType.is_active)}
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            getValue={(item) => item.uuid}
                            getLabel={(item) => item.name}
                            isLoading={leaveTypesLoading}
                            placeholder="Select leave category"
                            aria-invalid={
                              !!form.formState.errors.leave_type_uuid
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

              {employee &&
                (employee.attendances[0].status === AttendanceStatus.HALF_DAY ||
                  employee.attendances[0].status ===
                    AttendanceStatus.SHORT_LEAVE) && (
                  <FormField
                    control={form.control}
                    name="range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Range</FormLabel>
                        <FormControl>
                          <CustomSelect
                            label="Leave Range"
                            className="w-full"
                            data={Object.values(
                              employee.attendances[0].status ===
                                AttendanceStatus.HALF_DAY
                                ? HALF_DAY_RANGES
                                : SHORT_LEAVE_RANGES,
                            )}
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            getValue={(item) => item}
                            getLabel={(item) => RANGE_LABELS[item]}
                            isLoading={leaveTypesLoading}
                            placeholder="Select leave range"
                            aria-invalid={!!form.formState.errors.range}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

              <FormField
                control={form.control}
                name="remarks"
                render={({ field, fieldState }) => (
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      rows={4}
                      id="remarks"
                      maxLength={255}
                      value={field.value ?? ""}
                      aria-invalid={!!fieldState.error}
                      placeholder="Add your remarks here..."
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      className="min-h-20 whitespace-pre-wrap break-all max-h-40"
                    />

                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length ?? 0}/255 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
