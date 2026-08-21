"use client";

import TextField from "../fields/text-field";
import { Separator } from "@/components/ui/separator";
import SwitchField from "../fields/switch-field";
import { EditUserFormData } from "../../user.types";
import { useFormContext, useWatch } from "react-hook-form";
import Collapse from "@/shared/motion/collapse";

export default function PFDetails({ isEditing }: { isEditing: boolean }) {
  const { control } = useFormContext<EditUserFormData>();

  const isEnrolled = useWatch({
    control,
    name: "pf_information.is_enrolled",
  });
  return (
    <div className="space-y-3">
      <div className="rounded-t-sm flex justify-between items-center">
        <div>
          <p className="font-semibold">PF Details</p>
          <p className="text-sm text-muted-foreground">
            Provident Fund details and contribution information.
          </p>
        </div>
        <div className="flex items-center gap-2 w-5">
          <SwitchField
            name="pf_information.is_enrolled"
            isEditing={isEditing}
          />
        </div>
      </div>

      <Collapse open={Boolean(isEnrolled)}>
        <Separator />
        <div className="grid gap-3 sm:grid-cols-1">
          <TextField
            name="pf_information.uan_number"
            label="UAN Number"
            placeholder="Enter UAN number"
            isEditing={isEditing}
          />
        </div>
      </Collapse>
    </div>
  );
}
