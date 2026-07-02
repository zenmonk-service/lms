import CreateOrganizationForm from "@/components/organization/organization-management/components/create-orgnization";
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

interface IProps {
  organization: Organization;
}

const OrganizationCard = ({ organization }: IProps) => {
  const dispatch = useAppDispatch();

  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [active, setActive] = React.useState(organization.is_active);
  const [isLoading, setLoading] = React.useState(false);

  const onEdit = () => setEditOpen(true);
  const onInactivate = () => setConfirmOpen(true);

  const handleConfirm = async () => {
    setLoading(true);
    const result = active
      ? await dispatch(deactivateOrganizationAction({ org_uuid: organization.uuid }))
      : await dispatch(activateOrganizationAction({ org_uuid: organization.uuid }));

    if (deactivateOrganizationAction.fulfilled.match(result) || activateOrganizationAction.fulfilled.match(result)) {
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
              <div className="flex items-center gap-3">
                <Badge
                  variant={organization.is_active ? "default" : "destructive"}
                  className="text-[10px] font-semibold"
                >
                  {organization.is_active ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={active} onCheckedChange={onInactivate} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Globe size={14} />
              <p className="text-xs text-muted-foreground">
                {organization.domain}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {organization.description}
        </p>

        <Separator />

        <CardFooter className="px-0">
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
        title="Inactivate Organization"
        description="Are you sure you want to inactivate this organization?"
      />
    </>
  );
};

export default OrganizationCard;
