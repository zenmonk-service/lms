import { Upload } from "lucide-react";
import * as React from "react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPendingStatusChange } from "../../payroll/components/attendance-reconciliation";
import { AttendanceStatus } from "@/features/attendances/attendances.type";

interface IProps {
  open: boolean;
  isLoading: boolean;
  targetDate?: string;
  reportDate: string | null;
  setOpen: (open: boolean) => void;
  headers: { index: number; value: string }[];
  onConfirmUpload: (remark: string) => void | Promise<void>;
  mapFields: Record<string, { index: number; value: string }>;
  setPendingStatusChange: React.Dispatch<React.SetStateAction<IPendingStatusChange | null>>;
  setMapFields: React.Dispatch<React.SetStateAction<Record<string, { index: number; value: string }>>>;
};

const fields = [
  {
    key: "emp_code",
    label: "Employee Code",
    placeholder: "e.g. Employee ID",
  },
  {
    key: "in_time",
    label: "In Time",
    placeholder: "e.g. Punch In",
  },
  {
    key: "out_time",
    label: "Out Time",
    placeholder: "e.g. Punch Out",
  },
];

export function FieldMappingDialog({
  open,
  setOpen,
  reportDate,
  targetDate,
  mapFields,
  setMapFields,
  headers,
  setPendingStatusChange,
  onConfirmUpload,
  isLoading,
}: IProps) {
  const isValid = fields.every((field) => mapFields[field.key]?.value?.trim());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Field Mapping</DialogTitle>

          <DialogDescription>
            Enter the column names exactly as they appear in your attendance
            report for Date {reportDate}.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-[160px_24px_1fr] items-center gap-3"
              >
                <Label className="font-medium">{field.label}</Label>

                <span className="text-center text-muted-foreground">→</span>

                <Select
                  value={mapFields[field.key]?.value ?? ""}
                  onValueChange={(value) =>
                    setMapFields((prev) => ({
                      ...prev,
                      [field.key]: {
                        index: headers.findIndex((h) => h.value === value),
                        value,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>

                  <SelectContent>
                    {headers
                      .filter(
                        (x): x is { index: number; value: string } =>
                          !!x.value && String(x.value).trim() !== "",
                      )
                      .map((header) => (
                        <SelectItem key={header.index} value={header.value}>
                          {header.value}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
        {!isValid && (
          <p className="text-sm text-destructive">
            Please fill all mappings fields.
          </p>
        )}

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            disabled={!isValid || isLoading}
            onClick={() => {
              setPendingStatusChange({
                date: targetDate ?? reportDate!,
                status: AttendanceStatus.UPLOADED,
                onConfirm: onConfirmUpload,
              });
              setOpen(false);
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
