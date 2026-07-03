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

export default function AttendanceUpdateDialog({
  isTimeModalOpen,
  setIsTimeModalOpen,
  onSubmit,
  form
}: {
  isTimeModalOpen: boolean;
  setIsTimeModalOpen: (open: boolean) => void;
  onSubmit: (data: UpdateTimeForm) => void;
  form: ReturnType<typeof useForm<UpdateTimeForm>>;
}) {

  return (
    <Dialog open={isTimeModalOpen} onOpenChange={setIsTimeModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Attendance Time</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check In</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
