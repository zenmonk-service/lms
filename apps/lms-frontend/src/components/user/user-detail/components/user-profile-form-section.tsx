"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserEditPageProfileTabs from "./user-profile-tabs";
import UserEditPageDocumentsTab from "./user-documents-tab";
import { DocumentDraft } from "../user.types";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";

interface UserProfileFormSectionProps {
  readonly isEditing: boolean;
  readonly register: UseFormRegister<any>;
  readonly errors: FieldErrors<FieldValues>;
  readonly watchedRole: string;
  readonly watchedShift: string;
  readonly maritalStatus: string;
  readonly employmentType: string;
  readonly workMode: string;
  readonly roles: any[];
  readonly shifts: any[];
  readonly onRoleChange: (value: string) => void;
  readonly onShiftChange: (value: string) => void;
  readonly onMaritalStatusChange: (value: string) => void;
  readonly onEmploymentTypeChange: (value: string) => void;
  readonly onWorkModeChange: (value: string) => void;
  readonly visibleDocuments: any[];
  readonly pendingDeletedDocuments: any[];
  readonly pendingCreatedDocumentDrafts: DocumentDraft[];
  readonly pendingDeletedDocumentUuids: string[];
  readonly documentDrafts: DocumentDraft[];
  readonly documentValidationErrors: Record<number, { name?: string; files?: string }>;
  readonly addedDocumentIndices: Set<number>;
  readonly addDocumentDraft: () => void;
  readonly removeDocumentDraft: (index: number) => void;
  readonly handleAddDocumentToQueue: (index: number) => void;
  readonly handleDeleteDocument: (documentUuid: string) => void;
  readonly recoverDeletedDocument: (documentUuid: string) => void;
  readonly editQueuedDocumentDraft: (draftId: string) => void;
  readonly removeQueuedDocumentDraft: (draftId: string) => void;
  readonly updateDocumentDraft: (
    index: number,
    field: "name" | "number",
    value: string
  ) => void;
  readonly updateDocumentDraftFiles: (index: number, files: File[]) => void;
}

export default function UserProfileFormSection({
  isEditing,
  register,
  errors,
  watchedRole,
  watchedShift,
  maritalStatus,
  employmentType,
  workMode,
  roles,
  shifts,
  onRoleChange,
  onShiftChange,
  onMaritalStatusChange,
  onEmploymentTypeChange,
  onWorkModeChange,
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
}: Readonly<UserProfileFormSectionProps>) {
  return (
    <Card className="lg:col-span-2 border border-border rounded-lg shadow-none">
      <CardHeader>
        <CardTitle>Profile information</CardTitle>
        <CardDescription>
          View and update user details for this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="w-full">
            <TabsTrigger value="basic">Basic & Employment</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <UserEditPageProfileTabs
            isEditing={isEditing}
            register={register}
            errors={errors}
            watchedRole={watchedRole}
            watchedShift={watchedShift}
            maritalStatus={maritalStatus}
            employmentType={employmentType}
            workMode={workMode}
            roles={roles}
            shifts={shifts}
            onRoleChange={onRoleChange}
            onShiftChange={onShiftChange}
            onMaritalStatusChange={onMaritalStatusChange}
            onEmploymentTypeChange={onEmploymentTypeChange}
            onWorkModeChange={onWorkModeChange}
          />

          <UserEditPageDocumentsTab
            isEditing={isEditing}
            visibleDocuments={visibleDocuments}
            pendingDeletedDocuments={pendingDeletedDocuments}
            pendingCreatedDocumentDrafts={pendingCreatedDocumentDrafts}
            pendingDeletedDocumentUuids={pendingDeletedDocumentUuids}
            documentDrafts={documentDrafts}
            documentValidationErrors={documentValidationErrors}
            addedDocumentIndices={addedDocumentIndices}
            addDocumentDraft={addDocumentDraft}
            removeDocumentDraft={removeDocumentDraft}
            handleAddDocumentToQueue={handleAddDocumentToQueue}
            handleDeleteDocument={handleDeleteDocument}
            recoverDeletedDocument={recoverDeletedDocument}
            editQueuedDocumentDraft={editQueuedDocumentDraft}
            removeQueuedDocumentDraft={removeQueuedDocumentDraft}
            updateDocumentDraft={updateDocumentDraft}
            updateDocumentDraftFiles={updateDocumentDraftFiles}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
}
