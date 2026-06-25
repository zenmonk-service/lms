"use client";

import { Card } from "@/components/ui/card";
import TextField from "../fields/text-field";
import { Separator } from "@/components/ui/separator";
import SelectField from "../fields/select-field";
import { GuardianRelation } from "@/features/user/user.type";

export default function ContactInformation({
  isEditing,
}: {
  isEditing: boolean;
}) {
  return (
    <Card className="shadow-none rounded-lg py-4 px-6 gap-3 bg-background">
      <div className="rounded-t-sm">
        <p className="font-semibold">Contact & Emergency</p>
        <p className="text-sm text-muted-foreground">
          Maintain essential personal contact paths and emergency responses.
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-medium border-b border-border">Parent Information</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <TextField
              name="personal_information.parent_information.father_name"
              label="Father's Name"
              placeholder="Enter father's name"
              isEditing={isEditing}
            />
            <TextField
              name="personal_information.parent_information.father_phone"
              label="Father's Phone"
              placeholder="Enter father's phone number"
              isEditing={isEditing}
            />
          </div>
          <div className="space-y-3">
            <TextField
              name="personal_information.parent_information.mother_name"
              label="Mother's Name"
              placeholder="Enter mother's name"
              isEditing={isEditing}
            />
            <TextField
              name="personal_information.parent_information.mother_phone"
              label="Mother's Phone"
              placeholder="Enter mother's phone number"
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-8">
        <p className="font-medium border-b border-border">
          Guardian Information
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="personal_information.guardian_information.guardian_name"
            label="Guardian's Name"
            placeholder="Enter guardian's name"
            isEditing={isEditing}
          />
          <SelectField
            name="personal_information.guardian_information.guardian_relation"
            label="Guardian's Relation"
            isEditing={isEditing}
            options={Object.values(GuardianRelation).map((relation) => ({
              value: relation,
              label: relation,
            }))}
          />
          <div className="sm:col-span-2">
            <TextField
              name="personal_information.guardian_information.guardian_phone"
              label="Guardian's Phone"
              placeholder="Enter guardian's phone number"
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
