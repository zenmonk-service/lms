import { getSession } from "@/app/auth/get-auth.action";
import Dashboard from "@/components/dashboard/user-dashboard";
import MainContainer from "@/shared/main-container";

interface PageProps {
  params: {
    organization_uuid: string;
  };
}

const UserDashBoard = async ({ params }: PageProps) => {
  const session = await getSession();
  const { organization_uuid } = await params;
  return (
    <MainContainer>
      <Dashboard
        organization_uuid={organization_uuid}
        targetUserEmail={session?.user?.email ?? ""}
      />
    </MainContainer>
  );
};

export default UserDashBoard;
