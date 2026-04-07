import {
  ExternalLink,
  FilePlus2,
  Loader2,
  Pencil,
  Trash2,
  Undo2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import {
  DOCUMENT_NAME_MAX_LENGTH,
  DOCUMENT_NUMBER_MAX_LENGTH,
  type DocumentDraft,
  type UserDocument,
} from "./user-edit-page.types";

type UserEditPageDocumentsTabProps = {
  isLoading?: boolean;
  isEditing: boolean;
  visibleDocuments: UserDocument[];
  pendingDeletedDocuments: UserDocument[];
  pendingCreatedDocumentDrafts: DocumentDraft[];
  pendingDeletedDocumentUuids: string[];
  documentDrafts: DocumentDraft[];
  documentValidationErrors: Record<number, { name?: string; files?: string }>;
  addedDocumentIndices: Set<number>;
  addDocumentDraft: () => void;
  removeDocumentDraft: (index: number) => void;
  handleAddDocumentToQueue: (index: number) => void;
  handleDeleteDocument: (documentUuid: string) => void;
  recoverDeletedDocument: (documentUuid: string) => void;
  editQueuedDocumentDraft: (draftId: string) => void;
  removeQueuedDocumentDraft: (draftId: string) => void;
  updateDocumentDraft: (
    index: number,
    field: "name" | "number",
    value: string,
  ) => void;
  updateDocumentDraftFiles: (index: number, files: File[]) => void;
};

const getDocumentFileUrls = (document: UserDocument): string[] => {
  if (document.file_urls && document.file_urls.length > 0) {
    return document.file_urls;
  }
  if (document.file_url) {
    return [document.file_url];
  }
  return [];
};

const getDocumentFileNames = (document: UserDocument): string[] => {
  const metadataValue = document.metadata?.uploaded_file_names;

  if (Array.isArray(metadataValue)) {
    return metadataValue.filter((name) => typeof name === "string");
  }

  if (typeof metadataValue === "string") {
    return metadataValue
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
  }

  return [];
};

export default function UserEditPageDocumentsTab({
  isLoading = false,
  isEditing,
  visibleDocuments,
  pendingDeletedDocuments,
  pendingCreatedDocumentDrafts,
  pendingDeletedDocumentUuids,
  documentDrafts,
  documentValidationErrors,
  addedDocumentIndices,
  addDocumentDraft,
  removeDocumentDraft,
  handleAddDocumentToQueue,
  handleDeleteDocument,
  recoverDeletedDocument,
  editQueuedDocumentDraft,
  removeQueuedDocumentDraft,
  updateDocumentDraft,
  updateDocumentDraftFiles,
}: Readonly<UserEditPageDocumentsTabProps>) {
  if (isLoading) {
    return (
      <TabsContent value="documents" className="space-y-4">
        <div className="rounded-2xl border border-border/40 p-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="rounded-lg border border-dashed p-4 space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="grid gap-3">
            {["doc-card-1", "doc-card-2"].map((key) => (
              <div key={key} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-52" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    );
  }

  let documentsContent;
  if (visibleDocuments.length === 0) {
    documentsContent = (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No documents uploaded yet.
      </div>
    );
  } else {
    documentsContent = (
      <div className="grid gap-3">
        {visibleDocuments.map((document) => {
          const fileUrls = getDocumentFileUrls(document);
          const fileNames = getDocumentFileNames(document);
          const metadataEntries = Object.entries(
            document.metadata || {},
          ).filter(([key]) => key !== "uploaded_file_names");

          return (
            <div
              key={document.uuid}
              className="h-full rounded-xl border border-border/70 bg-card/80 p-4 space-y-3 shadow-xs transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className="text-sm font-semibold tracking-tight"
                    style={{ wordBreak: "break-word" }}
                  >
                    {document.document_name}
                  </p>
                  <p
                    className="text-xs text-muted-foreground mt-0.5"
                    style={{ wordBreak: "break-word" }}
                  >
                    {document.document_number || "No document number"}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleDeleteDocument(document.uuid)}
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              {fileUrls.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Attached files
                  </p>
                  <div className="flex flex-col gap-2">
                    {fileUrls.map((url, index) => (
                      <a
                        key={`${document.uuid}-file-${index}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-sm break-all"
                      >
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span>
                          {fileNames[index] || `View file ${index + 1}`}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {metadataEntries.length > 0 && (
                <div className="grid gap-1 rounded-md bg-muted/50 p-2.5 text-xs">
                  {metadataEntries.map(([key, value]) => (
                    <p key={`${document.uuid}-${key}`}>
                      <span className="font-medium">{key}:</span>{" "}
                      {Array.isArray(value) ? value.join(", ") : value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <TabsContent
      value="documents"
      className="rounded-lg border border-border p-6 bg-background space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-chart-3/10">
          <FilePlus2 className="h-5 w-5 text-chart-3" />
        </div>
        <div>
          <p className="font-bold">Employee documents</p>
          <p className="text-xs text-muted-foreground">
            Manage your employee documents
          </p>
        </div>
      </div>

      {isEditing && (
        <>
          {(pendingCreatedDocumentDrafts.length > 0 ||
            pendingDeletedDocumentUuids.length > 0) && (
            <div className="rounded-lg border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
              Pending changes: {pendingCreatedDocumentDrafts.length} new
              document(s) and {pendingDeletedDocumentUuids.length} delete(s).
              These will be permanently applied only after Save changes.
            </div>
          )}

          {pendingCreatedDocumentDrafts.length > 0 && (
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10 p-3 space-y-2">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Added documents (local queue)
              </p>
              <div className="space-y-2">
                {pendingCreatedDocumentDrafts.map((queuedDoc) => (
                  <div
                    key={queuedDoc.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200/60 bg-background/70 px-3 py-2 dark:border-emerald-800/40"
                  >
                    <div className="min-w-0 space-y-0.5 ">
                      <p className="text-sm font-medium text-foreground" style={{wordBreak:"break-word"}}>
                        {queuedDoc.name}
                      </p>
                      <p className="text-xs text-muted-foreground" style={{wordBreak:"break-word"}}>
                        {queuedDoc.number?.trim()
                          ? `No: ${queuedDoc.number.trim()} • `
                          : ""}
                        {queuedDoc.files.length} file(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => editQueuedDocumentDraft(queuedDoc.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => removeQueuedDocumentDraft(queuedDoc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                      <Badge className="shrink-0 rounded-full border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/40 dark:text-emerald-300">
                        ✓ Added
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingDeletedDocuments.length > 0 && (
            <div className="rounded-xl border border-red-200/60 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/10 p-3 space-y-2">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                Deleted documents (pending)
              </p>
              <div className="space-y-2">
                {pendingDeletedDocuments.map((deletedDoc) => (
                  <div
                    key={deletedDoc.uuid}
                    className="flex items-start justify-between gap-3 rounded-lg border border-red-200/60 bg-background/70 px-3 py-2 dark:border-red-800/40"
                  >
                    <div className="min-w-0 space-y-0.5 max-width-[240px]">
                      <p className="text-sm font-medium text-foreground" style={{wordBreak:"break-word"}}>
                        {deletedDoc.document_name }
                      </p>
                      <p className="text-xs text-muted-foreground" style={{wordBreak:"break-word"}}>
                        {deletedDoc.document_number || "No document number"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => recoverDeletedDocument(deletedDoc.uuid)}
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Recover
                      </Button>
                      <Badge className="shrink-0 rounded-full border border-red-300/70 bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:border-red-700/60 dark:bg-red-900/40 dark:text-red-300">
                        Deleted
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Document entries</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={addDocumentDraft}
              >
                <FilePlus2 className="h-4 w-4" />
                Add document
              </Button>
            </div>

            {documentDrafts.map((draft, index) => (
              <div
                key={draft.id}
                className="rounded-xl border border-border/70 bg-card/90 p-3.5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Document {index + 1}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-md px-3 text-xs"
                      onClick={() => handleAddDocumentToQueue(index)}
                    >
                      <FilePlus2 className="h-4 w-4" />
                      Add
                    </Button>
                    {documentDrafts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => removeDocumentDraft(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                    
                  </div>
                </div>

                {documentValidationErrors[index] && (
                  <div className="rounded-lg bg-red-50/70 border border-red-200/50 dark:bg-red-950/20 dark:border-red-700/30 p-2.5 space-y-1.5">
                    {documentValidationErrors[index].name && (
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                        {documentValidationErrors[index].name}
                      </p>
                    )}
                    {documentValidationErrors[index].files && (
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                        {documentValidationErrors[index].files}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Field>
                    <FieldLabel>Document Name</FieldLabel>
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        updateDocumentDraft(index, "name", event.target.value)
                      }
                      maxLength={DOCUMENT_NAME_MAX_LENGTH}
                      placeholder="e.g. Passport"
                      className={
                        documentValidationErrors[index]?.name ? "border-red-500" : ""
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Document Number</FieldLabel>
                    <Input
                      value={draft.number}
                      onChange={(event) =>
                        updateDocumentDraft(index, "number", event.target.value)
                      }
                      maxLength={DOCUMENT_NUMBER_MAX_LENGTH}
                      placeholder="Number"
                    />
                  </Field>
                  <Field className="md:col-span-2 lg:col-span-2">
                    <FieldLabel>Upload Files</FieldLabel>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,application/pdf"
                        onChange={(event) => {
                          const files = event.currentTarget.files;
                          // Only update if user actually selected files (not canceled the dialog)
                          if (files && files.length > 0) {
                            updateDocumentDraftFiles(index, Array.from(files));
                          }
                        }}
                        className={`file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/15 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-10 w-full min-w-0 rounded-lg border bg-background/60 px-3 py-1.5 shadow-xs outline-none text-sm cursor-pointer ${
                          draft.files.length > 0 ? "text-transparent" : ""
                        } ${
                          documentValidationErrors[index]?.files ? "border-red-500" : ""
                        }`}
                      />
                      {draft.files.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center px-3 text-xs text-muted-foreground">
                          <span className="truncate pl-28">
                            {Array.from(draft.files).map((file) => file.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {documentsContent}
    </TabsContent>
  );
}
