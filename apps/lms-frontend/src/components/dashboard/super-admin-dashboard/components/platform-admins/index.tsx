import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreatePlatformAdmin from "./create-platform-admin";
import { useState } from "react";
import { Organization } from "@/features/organizations/organizations.types";

interface IProps {
  organization: Organization;
}

const PlatformAdmins = ({ organization }: IProps) => {
  const [createPlatformAdminOpen, setCreatePlatformAdminOpen] = useState(false);

  const onCreatePlatformAdmin = () => setCreatePlatformAdminOpen(true);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Organization Admin
        </p>
        {organization.users && organization.users.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onCreatePlatformAdmin}
          >
            <Plus size={11} />
            Add Admin
          </Button>
        )}
      </div>
      <div className="overflow-auto max-h-40 pr-2">
        {organization.users?.length > 0 &&
          organization.users.map((user) => (
            <div key={user.user_id} className="py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <div className="flex items-center gap-2 justify-between">
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.created_at.split("T")[0]}</p>
              </div>
            </div>
          ))}
      </div>
      <CreatePlatformAdmin
        org_uuid={organization.uuid}
        open={createPlatformAdminOpen}
        onOpenChange={setCreatePlatformAdminOpen}
      />
    </div>
  );
};

export default PlatformAdmins;
