import { getSession } from "@/app/auth/get-auth.action";
import Dashboard from "@/components/dashboard/user-dashboard";
import MainContainer from "@/shared/main-container";

type PageProps = {
  params: Promise<{
    organization_uuid: string;
  }>;
  searchParams: Promise<{
    _permission_refresh?: string;
  }>;
};

const UserDashBoard = async ({ params, searchParams }: PageProps) => {
  const session = await getSession();
  const { organization_uuid } = await params;
  const { _permission_refresh } = await searchParams;
  return (
    <MainContainer>
      <Dashboard
        organization_uuid={organization_uuid}
        targetUserEmail={session?.user?.email ?? ""}
        _permission_refresh={_permission_refresh}
      />
    </MainContainer>
  );
};

export default UserDashBoard;
