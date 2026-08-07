"use client";

import { FormProvider } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ellipsis,
  Loader2Icon,
  NotepadText,
  Pen,
  Phone,
  Save,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import MainContainer from "@/shared/main-container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DesktopView from "@/shared/view/desktop-view";
import MobileView from "@/shared/view/mobile-view";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";

interface IProps {
  organizationUuid: string;
  userUuid: string;
}

export default function UserDetailPage({ organizationUuid, userUuid }: IProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState("Basic & Employment");

  const {
    currentUser,
    selectedUser,
    isLoadingUser,
  } = useUserDetailData(organizationUuid, userUuid);

  const can = usePermissionCheck();

  const { form, resetToSelectedUser } = useUserEditForm(selectedUser);
  const { confirmNavigation } = useNavigationGuard(form.formState.isDirty);

  const { onSubmit, isSaving } = useUpdateUser({
    organizationUuid,
    userUuid,
    selectedUser,
    currentUser,
    onSaved: () => setIsEditing(false),
  });

  const canEdit = can(PermissionTag.USER_MANAGEMENT, PermissionAction.UPDATE);
  const canViewLeaves = can(PermissionTag.LEAVE_REQUEST_MANAGEMENT, PermissionAction.READ);

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

  const isEditingButton = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => {
            if (!confirmNavigation()) return;
            setIsEditing(false);
            resetToSelectedUser();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" size="xs" disabled={isSaving || !form.formState.isDirty}>
          {isSaving ? <Loader2Icon className="animate-spin" /> : <Save />}
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MainContainer>
          <Tabs defaultValue="details">
            <div className="flex justify-between px-4 border-b border-border pb-2 sticky top-0 bg-background z-10">
              <Button
                type="button"
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
              <UserProfilePhoto
                organizationUuid={organizationUuid}
                userUuid={userUuid}
                userName={selectedUser.name}
                userEmail={selectedUser.email}
                userRole={selectedUser.role?.name || "No role"}
                isActive={selectedUser.is_active}
                button={canEdit && 
                  (isEditing ? isEditingButton() : (
                    <Button
                      size="xs"
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  ))
                }
              />
              <div className="overflow-y-auto max-h-[calc(100vh-305px)] relative no-scrollbar">
                <Tabs
                  defaultValue={tab}
                  value={tab}
                  onValueChange={(value) => setTab(value)}
                  orientation="vertical"
                  className="flex-col sm:flex-row-reverse"
                >
                  <DesktopView>
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
                  </DesktopView>

                  <MobileView className="sticky top-0 z-10 bg-card pb-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon-sm">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => setTab("Basic & Employment")}
                          >
                            <User size={16} className="mr-2" />
                            Basic & Employment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTab("Family Contacts")}
                          >
                            <Phone size={16} className="mr-2" />
                            Family Contacts
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTab("Documents")}>
                            <NotepadText size={16} className="mr-2" />
                            Documents
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </MobileView>

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
                      isEditing={isEditing}
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
        </MainContainer>
      </form>
    </FormProvider>
  );
}
