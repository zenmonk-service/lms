"use client";

import { useState } from "react";
import {
  Dot,
  ExternalLink,
  Loader2Icon,
  NotepadText,
  Trash2,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";
import { createUserDocumentAction } from "@/features/user/create-user-document/create-user-document.action";
import { deleteUserDocumentAction } from "@/features/user/delete-user-document/delete-user-document.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

const DOCUMENT_NAME_MAX_LENGTH = 60;
const DOCUMENT_NUMBER_MAX_LENGTH = 40;

export default function EmployeeDocuments({
  organizationUuid,
  userUuid,
}: {
  organizationUuid: string;
  userUuid: string;
}) {
  const dispatch = useAppDispatch();
  const { selectedUser } = useAppSelector((state) => state.userSlice);
  const documents = selectedUser?.documents || [];

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<{ name?: string; files?: string } | null>(
    null,
  );
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) return setError({ name: "Document name is required" });
    if (files.length === 0)
      return setError({ files: "Please select at least one file" });

    setError(null);
    setIsAdding(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result: any = await dispatch(imageUploadAction(formData));
        if (result?.payload?.success && result?.payload?.url)
          uploadedUrls.push(result.payload.url);
      }
      if (uploadedUrls.length === 0) return;

      await dispatch(
        createUserDocumentAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
          document_name: trimmedName,
          document_number: number.trim() || undefined,
          file_url: uploadedUrls[0],
          file_urls: uploadedUrls,
          metadata: { uploaded_file_names: files.map((f) => f.name) },
        }),
      ).unwrap();

      await dispatch(
        getOrganizationUserAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
        }),
      );
      setName("");
      setNumber("");
      setFiles([]);
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteUserDocumentAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
          document_uuid: documentToDelete,
        }),
      ).unwrap();
      await dispatch(
        getOrganizationUserAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
        }),
      );
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };

  return (
    <Card className="shadow-none rounded-lg py-4 px-6 gap-3 bg-background">
      <div className="rounded-t-sm">
        <p className="font-semibold">Employee Documents</p>
        <p className="text-sm text-muted-foreground">
          Manage verifiable files and certifications uploaded to the workspace.
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.uuid}
            className="flex items-center justify-between rounded-md border border-border p-4 bg-muted"
          >
            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 h-fit">
                <NotepadText size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold">{doc.document_name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {doc.updated_at.split("T")[0]}
                  </p>
                  <Dot size={12} />
                  {doc.metadata?.uploaded_file_names &&
                  doc.metadata.uploaded_file_names.length > 0 ? (
                    <Button
                      variant="link"
                      className="text-xs text-emerald-700 p-0! h-fit"
                      onClick={() => window.open(doc.file_url, "_blank")}
                    >
                      <ExternalLink className="h-3! w-3!" />{" "}
                      {doc.metadata.uploaded_file_names[0]}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No files uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDocumentToDelete(doc.uuid)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}

        <div className="grid gap-4 rounded-md border border-dashed p-4 sm:grid-cols-2">
          <Field className="gap-1">
            <Input
              placeholder="Document name"
              value={name}
              onChange={(e) =>
                setName(e.target.value.slice(0, DOCUMENT_NAME_MAX_LENGTH))
              }
            />
            {error?.name && (
              <FieldError
                errors={[{ message: error.name }]}
                className="text-xs"
              />
            )}
          </Field>

          <Field>
            <Input
              placeholder="Document number (optional)"
              value={number}
              onChange={(e) =>
                setNumber(e.target.value.slice(0, DOCUMENT_NUMBER_MAX_LENGTH))
              }
            />
          </Field>

          <Field className="gap-1 sm:col-span-2">
            <Input
              type="file"
              multiple
              onChange={(e) =>
                setFiles(e.target.files ? Array.from(e.target.files) : [])
              }
            />
            <FieldDescription>Select a file to upload.</FieldDescription>
            {error?.files && (
              <FieldError
                errors={[{ message: error.files }]}
                className="text-xs"
              />
            )}
          </Field>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            className="sm:col-span-2 w-fit"
          >
            {isAdding ? <Loader2Icon className="animate-spin" /> : <Upload />}
            Add Document
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isLoading={isDeleting}
        title="Delete Document?"
        handleConfirm={confirmDelete}
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        description="This will permanently remove the document. This action cannot be undone."
      />
    </Card>
  );
}
