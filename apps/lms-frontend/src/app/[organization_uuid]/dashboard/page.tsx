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
    <div className="p-4 w-11/12 min-[1400px]:w-3/4 mx-auto">
      <h1> this is vasudev </h1>
    <Dashboard
      organization_uuid={organization_uuid}
      email={session?.user?.email ?? ""}
    />
    </div>
  );
};

export default UserDashBoard;
