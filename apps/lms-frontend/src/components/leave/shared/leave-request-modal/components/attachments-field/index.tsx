import { LeaveRequestFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import { FileUploadField } from "@/shared/file-upload-field";
import { toastError } from "@/shared/toast/toast-error";
import { useAppDispatch } from "@/store";
import { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";

const AttachmentsField = () => {
  const dispatch = useAppDispatch();
  const { control } = useFormContext<LeaveRequestFormData>();

  const handleFileUpload = useCallback(
    async (formData: FormData) => {
      const res = await dispatch(fileUploadAction(formData));
      if (fileUploadAction.fulfilled.match(res)) {
        return res.payload.url;
      }
      toastError("File upload failed. Please try again.");
      throw new Error("File upload failed");
    },
    [dispatch],
  );

  return (
    <Controller
      name="documents"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1">
          <FieldLabel>Attachments</FieldLabel>
          <FieldDescription>
            Upload any relevant documents. (optional)
          </FieldDescription>
          <FileUploadField
            ref={field.ref}
            value={field.value ?? []}
            onChange={field.onChange}
            uploadAction={handleFileUpload}
            invalid={fieldState.invalid}
            maxFiles={2}
            maxSize={5 * 1024 * 1024}
          />
          <FieldError errors={[fieldState.error]} className="text-xs" />
        </Field>
      )}
    />
  );
};

export default AttachmentsField;
