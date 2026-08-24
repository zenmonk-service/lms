"use client";

import * as React from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import CustomSelect from "@/shared/select";
import { useAppDispatch } from "@/store";
import { DocumentTypes, type EditUserFormData } from "../../user.types";
import { FileUploadField } from "@/shared/file-upload-field";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import NoDataFound from "@/shared/no-data-found";
import { cn } from "@/lib/utils";
import SelectField from "../fields/select-field";
import TextField from "../fields/text-field";

interface IProps {
  organizationUuid: string;
  userUuid: string;
  isEditing: boolean;
}

export default function EmployeeDocuments({ isEditing }: IProps) {
  const dispatch = useAppDispatch();
  const { control } = useFormContext<EditUserFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const handleFileUpload = React.useCallback(
    async (formData: FormData): Promise<string> => {
      const res = await dispatch(fileUploadAction(formData));
      if (fileUploadAction.fulfilled.match(res)) {
        return res.payload.url;
      }
      throw new Error("File upload failed");
    },
    [dispatch],
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          fields.length === 0 &&
            "border border-border rounded-lg px-4 pt-4 items-center!",
          "flex flex-col gap-4",
          isEditing && "items-start",
        )}
      >
        {fields.length === 0 && (
          <NoDataFound
            title="No Documents found."
            message="There are no documents available for this employee. Please add documents to view them here."
          />
        )}
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() =>
              append({
                document_type: "" as DocumentTypes,
                document_number: "",
                attachments: [],
              }) as EditUserFormData["documents"]
            }
          >
            <Plus className="size-4" />
            Add document
          </Button>
        )}
      </div>

      {fields.map((field, index) => (
        <Card key={field.id} className="gap-3 p-4 shadow-none bg-background">
          <div className="flex items-start justify-between gap-2">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                name={`documents.${index}.document_type`}
                label="Document Type"
                isEditing={isEditing}
                options={Object.values(DocumentTypes).map((relation) => ({
                  value: relation,
                  label:
                    relation.slice(0, 1).toUpperCase() +
                    relation.slice(1).replaceAll("_", " ").toLowerCase(),
                }))}
              />

              <TextField
                name={`documents.${index}.document_number`}
                label="Document Number"
                placeholder="Enter document number"
                isEditing={isEditing}
              />
            </div>

            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                aria-label="Remove document"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>

          <Controller
            name={`documents.${index}.attachments`}
            control={control}
            render={({ field: attachField, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>Attachments</FieldLabel>
                <FileUploadField
                  ref={attachField.ref}
                  value={attachField.value ?? []}
                  onChange={attachField.onChange}
                  uploadAction={handleFileUpload}
                  invalid={fieldState.invalid}
                  disabled={!isEditing}
                  maxFiles={3}
                  maxSize={5 * 1024 * 1024}
                />
                <FieldError errors={[fieldState.error]} className="text-xs" />
              </Field>
            )}
          />
        </Card>
      ))}
    </div>
  );
}
