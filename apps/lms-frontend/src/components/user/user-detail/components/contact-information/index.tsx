"use client";

import { Card } from "@/components/ui/card";
import TextField from "../fields/text-field";
import { Separator } from "@/components/ui/separator";

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

      <div className="mb-5">
        <TextField
          name="official_phone"
          label="Official Phone Number"
          placeholder="Enter official phone number"
          isEditing={isEditing}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <p className="font-medium border-b border-border">
            Primary Emergency Contact
          </p>
          <TextField
            name="emergency_contact_name"
            label="Contact Name"
            placeholder="Enter emergency contact name"
            isEditing={isEditing}
          />
          <TextField
            name="emergency_contact_relation"
            label="Contact Relation"
            placeholder="Enter emergency contact relation"
            isEditing={isEditing}
          />
          <TextField
            name="emergency_contact_phone"
            label="Contact Phone"
            placeholder="Enter emergency contact phone"
            isEditing={isEditing}
          />
        </div>

        <div className="space-y-4">
          <p className="font-medium border-b border-border">Guardian Contact</p>
          <TextField
            name="guardian_contact_name"
            label="Contact Name"
            placeholder="Enter guardian contact name"
            isEditing={isEditing}
          />
          <TextField
            name="guardian_contact_relation"
            label="Contact Relation"
            placeholder="Enter guardian contact relation"
            isEditing={isEditing}
          />
          <TextField
            name="guardian_contact_phone"
            label="Contact Phone"
            placeholder="Enter guardian contact phone"
            isEditing={isEditing}
          />
        </div>
      </div>
    </Card>
  );
}
