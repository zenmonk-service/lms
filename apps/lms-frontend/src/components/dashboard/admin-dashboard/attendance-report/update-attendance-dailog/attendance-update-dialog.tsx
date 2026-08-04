import React from "react";
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
import { useForm } from "react-hook-form";
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

export default function AttendanceUpdateDialog({
  employee,
  isTimeModalOpen,
  setIsTimeModalOpen,
  onSubmit,
  form,
}: Readonly<{
  employee: AttendanceReportRow | null;
  onSubmit: (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
    data: UpdateTimeForm,
  ) => void;
  isTimeModalOpen: boolean;
  setIsTimeModalOpen: (open: boolean) => void;
  form: ReturnType<typeof useForm<UpdateTimeForm>>;
}>) {
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
                          <FormMessage />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />{" "}
                  </>
                )}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field, fieldState }) => (
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="remarks"
                      placeholder="Add your remarks here..."
                      rows={4}
                      className="min-h-20 whitespace-pre-wrap break-all"
                      aria-invalid={!!fieldState.error}
                      maxLength={255}
                    />

                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {form.watch("remarks")?.trim()?.length || 0}/255
                        characters
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
