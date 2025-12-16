import { getSession } from "@/app/auth/get-auth.action";
import Dashboard from "@/components/dashboard/dashboard";

interface PageProps {
  params: {
    organization_uuid: string;
  };
}

const UserDashBoard = async ({ params }: PageProps) => {
  const session = await getSession();
  const { organization_uuid } = await params;

  return (
    <Dashboard
      organization_uuid={organization_uuid} 
      email={session?.user?.email ?? ""}
    />
  );
};

export default UserDashBoard;
