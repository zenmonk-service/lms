import { Upload } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  mapFields: Record<string, string>;
  setMapFields: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
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
  fileInputRef,
  mapFields,
  setMapFields,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Field Mapping</DialogTitle>

          <DialogDescription>
            Enter the column names exactly as they appear in your attendance
            report.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-[160px_24px_1fr] items-center gap-3"
              >
                <Label className="font-medium">"{field.label}"</Label>

                <span className="text-center text-muted-foreground">→</span>

                <Input
                  placeholder={field.placeholder}
                  value={mapFields[field.key] ?? ""}
                  onChange={(e) =>
                    setMapFields((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={() => {
           fileInputRef?.current?.click();
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