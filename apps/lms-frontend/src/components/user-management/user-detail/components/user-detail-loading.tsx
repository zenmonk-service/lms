"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserEditPageProfileTabs from "./user-profile-tabs";
import UserEditPageDocumentsTab from "./user-documents-tab";
import { useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/haspermissios";

export default function UserDetailLoading() {
  const { currentUser, currentUserRolePermissions } = useAppSelector((state) => ({
    currentUser: state.userSlice.currentUser,
    currentUserRolePermissions: state.permissionSlice.currentUserRolePermissions,
  }));

  return (
    <div>
      <div className="w-11/12 min-[1400px]:w-3/4 mx-auto py-7 space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="mb-2">
              <TabsTrigger value="details">User Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              {hasPermissions(
                "leave_request_management",
                "read",
                currentUserRolePermissions,
                currentUser?.email,
              ) && <TabsTrigger value="leaves">Leaves</TabsTrigger>}
            </TabsList>
            <Button variant="link" disabled>
              Back
            </Button>
          </div>

          <TabsContent value="details" className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-7 space-y-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <Skeleton className="h-24 w-24 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-24 rounded-lg" />
                      <Skeleton className="h-6 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="lg:col-span-2 border border-border">
                <CardHeader>
                  <CardTitle>Profile information</CardTitle>
                  <CardDescription>
                    View and update user details for this workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList>
                      <TabsTrigger value="basic">
                        Basic & Employment
                      </TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <UserEditPageProfileTabs
                      isLoading
                      isEditing={false}
                      register={{} as any}
                      errors={{}}
                      watchedRole=""
                      watchedShift=""
                      maritalStatus=""
                      employmentType=""
                      workMode=""
                      roles={[]}
                      shifts={[]}
                      onRoleChange={() => {}}
                      onShiftChange={() => {}}
                      onMaritalStatusChange={() => {}}
                      onEmploymentTypeChange={() => {}}
                      onWorkModeChange={() => {}}
                    />

                    <UserEditPageDocumentsTab
                      isLoading
                      isEditing={false}
                      visibleDocuments={[]}
                      pendingDeletedDocuments={[]}
                      pendingCreatedDocumentDrafts={[]}
                      pendingDeletedDocumentUuids={[]}
                      documentDrafts={[]}
                      documentValidationErrors={{}}
                      addedDocumentIndices={new Set()}
                      addDocumentDraft={() => {}}
                      removeDocumentDraft={() => {}}
                      handleAddDocumentToQueue={() => {}}
                      handleDeleteDocument={() => {}}
                      recoverDeletedDocument={() => {}}
                      editQueuedDocumentDraft={() => {}}
                      removeQueuedDocumentDraft={() => {}}
                      updateDocumentDraft={() => {}}
                      updateDocumentDraftFiles={() => {}}
                    />
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
