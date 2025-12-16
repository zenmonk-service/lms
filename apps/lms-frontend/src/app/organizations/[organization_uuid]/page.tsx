
import ManageOrganizationsUser from "@/components/organization/organization-user-management";

export default async function ManageOrganizations({ params }: any) {

 const resolvedParams = await Promise.resolve(params);
  const organization_uuid = Array.isArray(resolvedParams.organization_uuid)
    ? resolvedParams.organization_uuid[0]
    : resolvedParams.organization_uuid;


  return <ManageOrganizationsUser organization_uuid={organization_uuid} />;
}
