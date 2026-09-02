"use client";

import { Separator } from "@/components/ui/separator";
import TextField from "../fields/text-field";
import SelectField from "../fields/select-field";
import { Gender } from "@/features/user/user.type";
import DatePickerField from "../fields/date-picker";
import TextArea from "../fields/text-area";
import { subYears } from "date-fns";

export default function BasicDetails({ isEditing }: { isEditing: boolean }) {
  const dobMaxDate = subYears(new Date(), 18);

  return (
    <div className="space-y-3">
      <div className="rounded-t-sm">
        <p className="font-semibold">Basic Details</p>
        <p className="text-sm text-muted-foreground">
          Update workspace identification and fundamental profile records.
        </p>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            name="personal_information.phone_number"
            label="Phone Number"
            placeholder="Enter phone number"
            isEditing={isEditing}
          />
        </div>

        <DatePickerField
          name="personal_information.dob"
          label="Date of Birth"
          isEditing={isEditing}
          allowFutureDates={false}
          maxDate={dobMaxDate}
          fromYear={1900}
          toYear={dobMaxDate.getFullYear()}
          placeholder="Select date of birth"
        />

        <SelectField
          name="personal_information.gender"
          label="Gender"
          isEditing={isEditing}
          options={Object.values(Gender).map((gender) => ({
            value: gender,
            label: gender.slice(0, 1).toUpperCase() + gender.slice(1),
          }))}
        />

        <TextArea
          name="personal_information.current_address"
          label="Current Address"
          placeholder="Enter current address"
          isEditing={isEditing}
        />
        <TextArea
          name="personal_information.permanent_address"
          label="Permanent Address"
          placeholder="Enter permanent address"
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}
