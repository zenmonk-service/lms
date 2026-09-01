"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NumberField from "../fields/number-field";

export default function UserSettings({ isEditing }: { isEditing: boolean }) {
  return (
    <Card className="shadow-none rounded-lg py-4 px-6 gap-3 bg-background">
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Leave Exception Balances</p>
          <p className="text-sm text-muted-foreground">
            Configure the leave exception balances for clubbing, sandwich, and past dated leaves. These settings allow you to manage and track the leave exceptions for employees effectively.
          </p>
        </div>
        <Separator />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <NumberField
              name="clubbing_leave_exception_balance"
              label="Clubbing leave exception balance"
              placeholder="Enter clubbing leave exception balance"
              isEditing={isEditing}
              maxValue={100}
            />
            <NumberField
              name="sandwich_leave_exception_balance"
              label="Sandwich leave exception balance"
              placeholder="Enter sandwich leave exception balance"
              isEditing={isEditing}
              maxValue={100}
            />
          </div>
          <div className="space-y-3">
            <NumberField
              name="past_dated_leave_balance"
              label="Past Dated Leave Balance"
              placeholder="Enter past dated leave balance"
              isEditing={isEditing}
              maxValue={100}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
