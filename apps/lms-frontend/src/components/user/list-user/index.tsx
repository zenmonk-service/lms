"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPagination, UserInterface } from "@/features/user/user.slice";
import { hasPermissions } from "@/lib/haspermissios";
import DataTable, { PaginationState } from "@/shared/table";
import NoPermission from "@/shared/no-permission";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import Title from "@/shared/typography/title";
import CreateUser from "../create-user";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useUserColumns } from "../hooks/user-user-columns";

export default function ManageOrganizationsUser({
  organization_uuid,
}: Readonly<{
  organization_uuid?: string;
}>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);
  const { users, isLoading, total, pagination, currentUser } = useAppSelector((state) => state.userSlice);
  
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserInterface | null>(null);

  const columns = useUserColumns({
    onSelectUser: (user) => {
      setSelectedUser(user);
      setIsProfileOpen(true);
    },
  });

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    dispatch(setPagination({ ...pagination, ...newPagination }));
  };

  React.useEffect(() => {
    if (
      organization_uuid !== currentOrganization.uuid &&
      organization_uuid &&
      currentOrganization.uuid
    ) {
      router.push("/organizations");
    }

    if (currentOrganization.uuid) {
      dispatch(
        listUserAction({
          org_uuid: currentOrganization.uuid,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            search: pagination.search?.trim(),
          },
        }),
      );
    }
  }, [currentOrganization.uuid, pagination]);

  React.useEffect(() => {
    return () => {
      dispatch(setPagination({ page: 1, limit: 10, search: "" }));
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="w-11/12 min-[1400px]:w-3/4 p-6">
          <Title
            title={{
              text: "User Management",
              className: "",
            }}
            description={{
              text: "Manage your organization users and their associated permissions.",
              className: "",
            }}
            className=""
            button={
              hasPermissions(
                "user_management",
                "create",
                currentUserRolePermissions,
                currentUser?.email,
              ) && (
                <CreateUser
                  org_uuid={currentOrganization.uuid}
                  isEdited={false}
                />
              )
            }
          />

          {hasPermissions(
            "user_management",
            "read",
            currentUserRolePermissions,
            currentUser?.email,
          ) ? (
            <DataTable
              data={users || []}
              columns={columns}
              isLoading={isLoading}
              totalCount={total || 0}
              pagination={pagination}
              searchValue={pagination.search}
              maxHeight="calc(100vh - 362px)"
              onPaginationChange={handlePaginationChange}
              searchPlaceholder="Search users by name or email..."
              noDataMessage="Establish your organization's user base to start managing roles and permissions effectively."
            />
          ) : (
            <NoPermission moduleName="User Management" />
          )}
        </div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              User Profile
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4 border-b border-border pb-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage
                    src={selectedUser.image || ""}
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    {selectedUser.name}
                  </h3>
                  <Badge
                    variant={selectedUser.is_active ? "default" : "secondary"}
                  >
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-lg bg-muted p-3 transition-colors hover:bg-muted/80">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-muted p-3 transition-colors hover:bg-muted/80">
                  <div className="rounded-full bg-accent/10 p-2">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.role.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-muted p-3 transition-colors hover:bg-muted/80">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium text-foreground">
                      {format(
                        new Date(selectedUser.created_at),
                        "MMMM dd, yyyy",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
