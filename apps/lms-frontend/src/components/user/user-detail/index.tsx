"use client";

import { FormProvider } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, NotepadText, Phone, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermissions } from "@/lib/haspermissios";
import LeaveRequest from "@/components/leave/list-user-leave-request";
import UserProfilePhoto from "./components/user-profile-photo";
import BasicDetails from "./components/basic-details";
import EmploymentDetails from "./components/employment-details";
import ContactInformation from "./components/contact-information";
import EmployeeDocuments from "./components/employee-documents";
import { useUserDetailData } from "./hooks/use-user-detail-data";
import { useUserEditForm } from "./hooks/use-user-edit-form";
import { useUpdateUser } from "./hooks/use-update-user";

import { Card } from "@/components/ui/card";
import NoDataFound from "@/shared/no-data-found";
import { UserDetailSkeleton } from "./components/skeleton";
import { useNavigationGuard } from "@/shared/hooks/user-navigation-guard";

interface IProps {
  organizationUuid: string;
  userUuid: string;
}

export default function UserDetailPage({ organizationUuid, userUuid }: IProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const {
    currentUser,
    selectedUser,
    currentUserRolePermissions,
    isLoadingUser,
  } = useUserDetailData(organizationUuid, userUuid);

  const { form, resetToSelectedUser } = useUserEditForm(selectedUser);
  const { confirmNavigation } = useNavigationGuard(form.formState.isDirty);

  const { onSubmit, isSaving } = useUpdateUser({
    organizationUuid,
    userUuid,
    selectedUser,
    currentUser,
    onSaved: () => setIsEditing(false),
  });

  const canEdit = hasPermissions(
    "user_management",
    "update",
    currentUserRolePermissions,
    currentUser?.email,
  );
  const canViewLeaves = hasPermissions(
    "leave_request_management",
    "read",
    currentUserRolePermissions,
    currentUser?.email,
  );

  if (isLoadingUser) return <UserDetailSkeleton />;
  if (!selectedUser) {
    return (
      <div className="min-h-[calc(100vh-101px)] flex justify-center items-center flex-col bg-card p-6 m-6 rounded-lg border border-border">
        <NoDataFound
          title="Employee not found"
          message="The requested employee was not found."
        />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-11/12 min-[1400px]:w-3/4 mx-auto px-6 pb-6">
          <Tabs defaultValue="details">
            <div className="flex justify-between px-4 border-b border-border pb-2 pt-6 sticky top-0 bg-background z-10">
              <Button
                variant="link"
                onClick={() => router.back()}
                className="p-0 h-fit self-end"
              >
                Back
              </Button>
              <TabsList>
                <TabsTrigger value="details">User Details</TabsTrigger>
                {canViewLeaves && (
                  <TabsTrigger value="leaves">Leaves</TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent
              value="details"
              className="space-y-4 mt-4 py-4 border border-border p-4 rounded-lg bg-card"
            >
              <div className="flex items-center justify-between">
                <UserProfilePhoto
                  organizationUuid={organizationUuid}
                  userUuid={userUuid}
                  userName={selectedUser.name}
                  userEmail={selectedUser.email}
                  userRole={selectedUser.role?.name || "No role"}
                  isActive={selectedUser.is_active}
                />

                {canEdit &&
                  (isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (!confirmNavigation()) return;
                          setIsEditing(false);
                          resetToSelectedUser();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving || !form.formState.isDirty}
                      >
                        {isSaving ? <Loader2Icon className="animate-spin" /> : <Save />}
                        Save changes
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  ))}
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-305px)] relative no-scrollbar">
                <Tabs
                  defaultValue="Basic & Employment"
                  orientation="vertical"
                  className="flex-row-reverse"
                >
                  <TabsList className="sticky top-0 z-10">
                    <TabsTrigger value="Basic & Employment">
                      <User />
                      Basic & Employment
                    </TabsTrigger>
                    <TabsTrigger value="Family Contacts">
                      <Phone />
                      Family Contacts
                    </TabsTrigger>
                    <TabsTrigger value="Documents">
                      <NotepadText />
                      Documents
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="Basic & Employment">
                    <Card className="shadow-none rounded-lg py-4 px-6 gap-8 bg-background">
                      <BasicDetails isEditing={isEditing} />
                      <EmploymentDetails isEditing={isEditing} />
                    </Card>
                  </TabsContent>

                  <TabsContent value="Family Contacts">
                    <ContactInformation isEditing={isEditing} />
                  </TabsContent>

                  <TabsContent value="Documents">
                    <EmployeeDocuments
                      organizationUuid={organizationUuid}
                      userUuid={userUuid}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {canViewLeaves && (
              <TabsContent value="leaves">
                <LeaveRequest isView={true} userUUId={selectedUser.user_id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </form>
    </FormProvider>
  );
}
