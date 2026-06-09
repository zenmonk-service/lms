import UserDetailPage from "@/components/user/user-detail";

interface UserDetailsPageProps {
  params:
    | {
        organization_uuid: string;
        user_uuid: string;
      }
    | Promise<{
        organization_uuid: string;
        user_uuid: string;
      }>;
}

export default async function UserDetails({
  params,
}: Readonly<UserDetailsPageProps>) {
  const resolvedParams = await params;

  return (
    <UserDetailPage
      organizationUuid={resolvedParams.organization_uuid}
      userUuid={resolvedParams.user_uuid}
    />
  );
}
