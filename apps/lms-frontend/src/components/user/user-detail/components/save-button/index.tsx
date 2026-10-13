
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Loader2Icon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

function normalizeForComparison(value: any): any {
  if (typeof value === "string") {
    return value.replace(/\s+$/, "");
  }

  if (Array.isArray(value)) {
    return value.map(normalizeForComparison);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        normalizeForComparison(val),
      ]),
    );
  }

  return value;
}

export default function UserSaveButton({
  isSaving,
}: {
  isSaving: boolean;
}) {
  const { control, formState } = useFormContext();

  const currentValues = useWatch({ control });
  const defaultValues = formState.defaultValues;

  const hasMeaningfulChanges =
    JSON.stringify(normalizeForComparison(currentValues)) !==
    JSON.stringify(normalizeForComparison(defaultValues));

  return (
    <Button
      type="submit"
      size="xs"
      disabled={
        isSaving ||
        !formState.isDirty ||
        !hasMeaningfulChanges
      }
    >
      {isSaving ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <Save />
      )}
      <span className="hidden sm:inline">Save</span>
    </Button>
  );
}
