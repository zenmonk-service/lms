import { Button } from "@/components/ui/button";
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
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  createOrganizationShiftAction,
  listOrganizationShiftsAction,
  updateOrganizationShiftAction,
} from "@/features/shift/shift.action";
import { Shift } from "@/features/shift/shift.slice";
import { UpdateShiftPayload } from "@/features/shift/shift.type";
import { toastError } from "@/shared/toast/toast-error";
import { useAppDispatch, useAppSelector } from "@/store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";

interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  shift?: Shift;
  title?: string;
  desc?: string;
  isEditing?: boolean;
  isLoading?: boolean;
}

const shiftSchema = z
  .object({
    name: z.string().trim().nonempty("Shift name is required"),
    start_time: z.string().trim().nonempty("Start time is required"),
    end_time: z.string().trim().nonempty("End time is required"),
    flexible_time: z.string().trim().nonempty("Flexible time is required"),
    effective_hours: z.coerce
      .number("Effective hours must be a number")
      .min(1, "Effective hour must at least be an hour")
      .transform((val) => parseFloat(val.toFixed(2))),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      return data.start_time < data.end_time;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

type ShiftDraft = z.infer<typeof shiftSchema>;

const Modal = ({
  open,
  onOpenChange,
  shift,
  title = "Configure Shift",
  desc = "Operational window parameters",
  isEditing = false,
  isLoading = false,
}: ModalProps) => {
  const [draft, setDraft] = useState<ShiftDraft>({
    name: "",
    start_time: "",
    end_time: "",
    flexible_time: "",
    effective_hours: 0,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShiftDraft, string>>
  >({});

  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (shift && open) {
      setDraft({
        name: shift.name ?? "",
        start_time: shift.start_time ?? "",
        end_time: shift.end_time ?? "",
        flexible_time: shift.flexible_time ?? "",
        effective_hours: shift.effective_hours ?? 0,
      });
      setErrors({});
    }

    return () => {
      setDraft({
        name: "",
        start_time: "",
        end_time: "",
        flexible_time: "",
        effective_hours: 0,
      });
      setErrors({});
    };
  }, [shift, open]);

  const handleChange =
    <K extends keyof ShiftDraft>(key: K) =>
    (value: ShiftDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    };

  const handleSave = async () => {
    const result = shiftSchema.safeParse(draft);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ShiftDraft, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0];
        if (path) fieldErrors[path as keyof ShiftDraft] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    let shiftData: UpdateShiftPayload = {} as UpdateShiftPayload;
    if (shift)
      shiftData = {
        org_uuid: currentOrganization.uuid,
        uuid: shift?.uuid,
        ...result.data,
      };
    try {
      isEditing && shift
        ? await dispatch(
            updateOrganizationShiftAction({
              ...shiftData,
            })
          )
        : await dispatch(
            createOrganizationShiftAction({
              org_uuid: currentOrganization.uuid,
              ...result.data,
            })
          );
      await dispatch(listOrganizationShiftsAction(currentOrganization.uuid));
    } catch (error) {
      toastError("Failed to save shift.");
    } finally {
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex items-center justify-between">
          <Field className="gap-1 flex-1">
            <FieldLabel className="text-card-foreground">
              Profile identity
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                type="text"
                placeholder="Shift name (e.g., Morning Shift)"
                value={draft.name}
                onChange={(e) => handleChange("name")(e.target.value)}
                aria-invalid={!!errors.name}
              />
            </InputGroup>
            <FieldError
              errors={[{ message: errors.name }]}
              className="text-xs"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex-1">
            <Field className="gap-1">
              <FieldLabel className="text-card-foreground">
                Start time
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="time"
                  value={draft.start_time}
                  onChange={(e) => handleChange("start_time")(e.target.value)}
                  aria-invalid={!!errors.start_time}
                />
              </InputGroup>
              <FieldError
                errors={[{ message: errors.start_time }]}
                className="text-xs"
              />
            </Field>
          </div>

          <div className="flex-1">
            <Field className="gap-1">
              <FieldLabel className="text-card-foreground">End time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="time"
                  value={draft.end_time}
                  onChange={(e) => handleChange("end_time")(e.target.value)}
                  aria-invalid={!!errors.end_time}
                />
              </InputGroup>
              <FieldError
                errors={[{ message: errors.end_time }]}
                className="text-xs"
              />
            </Field>
          </div>

          <div className="flex-1">
            <Field className="gap-1">
              <FieldLabel className="text-card-foreground">
                Flexible time <span className="text-xs">(in minutes)</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  placeholder="(eg., 60 minutes)"
                  value={draft.flexible_time ?? ""}
                  onChange={(e) =>
                    handleChange("flexible_time")(e.target.value)
                  }
                  aria-invalid={!!errors.flexible_time}
                />
              </InputGroup>
              <FieldError
                errors={[{ message: errors.flexible_time }]}
                className="text-xs"
              />
            </Field>
          </div>

          <div className="flex-1">
            <Field className="gap-1">
              <FieldLabel className="text-card-foreground">
                Effective hours
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="number"
                  step={0.1}
                  min={0}
                  value={parseFloat(draft.effective_hours.toString()) ?? 0}
                  onChange={(e) =>
                    handleChange("effective_hours")(
                      parseFloat(e.target.value) || 0
                    )
                  }
                  aria-invalid={!!errors.effective_hours}
                />
              </InputGroup>
              <FieldError
                errors={[{ message: errors.effective_hours }]}
                className="text-xs word-break"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
