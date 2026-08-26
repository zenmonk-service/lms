"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NumberField from "../fields/number-field";

export default function UserSettings({ isEditing }: { isEditing: boolean }) {
  return (
    <Card className="shadow-none rounded-lg py-4 px-6 gap-3 bg-background">
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Parent Information</p>
          <p className="text-sm text-muted-foreground">
            Provide details of the employee's parents for emergency contact and
            support.
          </p>
        </div>
        <Separator />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <NumberField
              name="clubbing_leave_exception_balance"
              label="clubbing leave exception balance"
              placeholder="Enter clubbing leave exception balance"
              isEditing={isEditing}
            />
            <NumberField
              name="sandwich_leave_exception_balance"
              label="sandwich leave exception balance"
              placeholder="Enter sandwich leave exception balance"
              isEditing={isEditing}
            />
          </div>
          <div className="space-y-3">
            <NumberField
              name="past_dated_leave_balance"
              label="Past Dated Leave Balance"
              placeholder="Enter past dated leave balance"
              isEditing={isEditing}
            />
       
          </div>
        </div>
      </div>
    </Card>
  );
}
