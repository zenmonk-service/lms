import CreateOrganizationForm from "@/components/dashboard/super-admin-dashboard/components/create-orgnization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { activateOrganizationAction } from "@/features/organizations/activate-organization/activate-organization.action";
import { deactivateOrganizationAction } from "@/features/organizations/deactivate-organization/deactivate-organization.action";
import { Organization } from "@/features/organizations/organizations.types";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { useAppDispatch } from "@/store";
import { getInitials } from "@/utils/get-initials";
import { Building2, Globe } from "lucide-react";
import React from "react";
import PlatformAdmins from "../platform-admins";

interface IProps {
  organization: Organization;
}

const OrganizationCard = ({ organization }: IProps) => {
  const dispatch = useAppDispatch();

  const [isLoading, setLoading] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [active, setActive] = React.useState(organization.is_active);

  const onEdit = () => setEditOpen(true);
  const onInactivate = () => setConfirmOpen(true);

  const handleConfirm = async () => {
    setLoading(true);
    const result = active
      ? await dispatch(deactivateOrganizationAction({ org_uuid: organization.uuid }))
      : await dispatch(activateOrganizationAction({ org_uuid: organization.uuid }));

    if (
      deactivateOrganizationAction.fulfilled.match(result) ||
      activateOrganizationAction.fulfilled.match(result)
    ) {
      setActive(!active);
      setConfirmOpen(false);
    }

    setLoading(false);
  };

  return (
    <>
      <Card className="shadow-none p-4 rounded-md gap-2">
        <div className="flex gap-4">
          <Avatar className="size-14 rounded-lg">
            {organization.logo_url && (
              <AvatarImage
                src={organization.logo_url}
                alt={organization.name}
              />
            )}
            <AvatarFallback className="rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {getInitials(organization.name) || (
                <Building2 className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="mt-auto flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xl font-semibold truncate min-w-0">
                {organization.name}
              </p>
              <Switch checked={active} onCheckedChange={onInactivate} />
            </div>
            <div className="flex items-center gap-1">
              <Globe size={14} />
              <p className="text-xs text-muted-foreground">
                {organization.domain}
              </p>
            </div>
          </div>
        </div>
        
        <Separator />
        <PlatformAdmins organization={organization}/>
        <Separator className="mt-auto"/>

        <CardFooter className="px-0">
          <Badge
            variant={active ? "default" : "destructive"}
            className="text-[10px] font-semibold"
          >
            {active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="link"
            size="sm"
            className="ml-auto px-0"
            onClick={onEdit}
          >
            Edit
          </Button>
        </CardFooter>
      </Card>

      <CreateOrganizationForm
        open={editOpen}
        onOpenChange={setEditOpen}
        organization={organization}
      />

      <ConfirmationDialog
        open={confirmOpen}
        isLoading={isLoading}
        onOpenChange={setConfirmOpen}
        handleConfirm={handleConfirm}
        title={active ? "Inactivate Organization" : "Activate Organization"}
        description={`Are you sure you want to ${active ? "inactivate" : "activate"} this organization?`}
      />
    </>
  );
};

export default OrganizationCard;
