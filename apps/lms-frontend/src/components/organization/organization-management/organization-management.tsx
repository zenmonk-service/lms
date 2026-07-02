"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { useAppSelector } from "@/store";
import { getInitials } from "@/utils/get-initials";
import { Building2, Edit, Globe, Trash2 } from "lucide-react";
import React, { useState } from "react";
import CreateOrganizationForm from "./components/create-orgnization";

const OrganizationManagement = () => {
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  return (
    <>
      <Card className="shadow-none p-4 rounded-md">
        <div className="flex gap-4">
          <Avatar className="size-16 rounded-lg">
            {currentOrganization.logo_url && (
              <AvatarImage
                src={currentOrganization.logo_url}
                alt={currentOrganization.name}
              />
            )}
            <AvatarFallback className="rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {getInitials(currentOrganization.name) || (
                <Building2 className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="mt-auto flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-foreground">
                {currentOrganization.name}
              </h1>
              <div className="space-x-4">
                <Button size="icon-sm" variant="secondary" onClick={() => setIsCreateOrgOpen(true)}>
                  <Edit className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => setIsConfirmationOpen(true)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Globe size={14} />
              <p className="text-xs text-muted-foreground">
                {currentOrganization.domain}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <CreateOrganizationForm
        open={isCreateOrgOpen}
        onOpenChange={setIsCreateOrgOpen}
        organization={currentOrganization}
      />

      <ConfirmationDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action cannot be undone."
      />
    </>
  );
};

export default OrganizationManagement;
