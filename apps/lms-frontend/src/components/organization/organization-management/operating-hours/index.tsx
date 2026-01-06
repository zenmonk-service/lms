"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WorkDays } from "@/features/organizations/organizations.type";
import { Activity, ArrowRight, PenLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";
import Modal from "./modal";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteOrganizationShiftAction, listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { toastError } from "@/shared/toast/toast-error";

const workDays = [
  { label: "Sun", value: WorkDays.SUNDAY },
  { label: "Mon", value: WorkDays.MONDAY },
  { label: "Tue", value: WorkDays.TUESDAY },
  { label: "Wed", value: WorkDays.WEDNESDAY },
  { label: "Thu", value: WorkDays.THURSDAY },
  { label: "Fri", value: WorkDays.FRIDAY },
  { label: "Sat", value: WorkDays.SATURDAY },
];

interface OperatingHoursProps {
  control: Control<any>;
}

const OperatingHours = ({ control }: OperatingHoursProps) => {
  const { shifts, isLoading } = useAppSelector((state) => state.shiftSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState<boolean>(false);
  const [shift, setShift] = useState<(typeof shifts)[0]>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedShiftUuid, setSelectedShiftUuid] = useState<string>("");

  const handleEditShift = (index: number) => {
    setIsEditing(true);
    setShift(shifts[index]);
    setOpen(true);
  };

  const handleAddShift = () => {
    setIsEditing(false);
    setShift(undefined);
    setOpen(true);
  };

  const handleCancel = () => {
    setShowAlert(false);
  };

  const handleDelete = (uuid: string) => {
    setShowAlert(true);
    setSelectedShiftUuid(uuid);
  };

  const handleContinue = async () => {
    try {
      await dispatch(
        deleteOrganizationShiftAction({
          org_uuid: currentOrganization.uuid,
          uuid: selectedShiftUuid,
        })
      );
      await dispatch(listOrganizationShiftsAction(currentOrganization.uuid));
    } catch (error) {
      toastError("Failed to delete shift.");
    } finally {
      setShowAlert(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Operating Hours</h1>
        <p className="text-sm text-muted-foreground">
          Configure the work week and standard daily shift timings.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Controller
          name="work_days"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="lg"
                value={field.value}
                onValueChange={field.onChange}
                className="items-start justify-start"
              >
                <div className="flex flex-wrap gap-3">
                  {workDays.map((day) => (
                    <ToggleGroupItem
                      {...field}
                      key={day.value}
                      value={day.value}
                      aria-label={`Toggle ${day.label}`}
                      aria-invalid={fieldState.invalid}
                    >
                      {day.label}
                    </ToggleGroupItem>
                  ))}
                </div>
              </ToggleGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} className="text-xs" />
              )}
            </Field>
          )}
        />

        <Separator />

        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">Shift Management</h2>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleAddShift}
          >
            <Plus /> Add Shift
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {shifts.map((shift, index) => (
            <div
              key={shift.uuid}
              className="flex-1 bg-card p-4 rounded-md border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md p-2 bg-accent">
                    <Activity className="h-4 w-4" />
                  </div>
                  <p className="text-card-foreground font-bold">{shift.name}</p>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => handleEditShift(index)}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>

                  {shifts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => handleDelete(shift.uuid)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold mt-4 text-card-foreground">
                <div className="flex items-center gap-1">
                  <p>{shift.start_time}</p>
                  <ArrowRight className="w-3 h-3" strokeWidth={3} />
                  <p>{shift.end_time}</p>
                </div>
                <div>
                  <p className="uppercase">
                    {shift.effective_hours}H Effective
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        shift={shift}
        isEditing={isEditing}
        isLoading={isLoading}
      />
      <Alert
        open={showAlert}
        onOpenChange={setShowAlert}
        handleContinue={handleContinue}
        handleCancel={handleCancel}
      />
    </div>
  );
};

const Alert = ({
  open,
  onOpenChange,
  handleContinue,
  handleCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleContinue: () => void;
  handleCancel: () => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete this shift, you would have to reassign users under
            this shift to a different shift.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OperatingHours;
