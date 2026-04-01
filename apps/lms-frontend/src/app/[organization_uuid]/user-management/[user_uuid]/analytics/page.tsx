import Dashboard from "@/components/dashboard/dashboard";
import { getSession } from "@/app/auth/get-auth.action";

interface UserPageProps {
  params:
    | {
        organization_uuid: string;
        user_uuid: string;
      }
    | Promise<{
        organization_uuid: string;
        user_uuid: string;
      }>;
  searchParams?:
    | {
        user_name?: string;
        user_email?: string;
      }
    | Promise<{
        user_name?: string;
        user_email?: string;
      }>;
}

export default async function UserDetails({
  params,
  searchParams,
}: Readonly<UserPageProps>) {
  const session = await getSession();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const userName = resolvedSearchParams?.user_name;
  const userEmail = resolvedSearchParams?.user_email;

  return (
    <Dashboard
      organization_uuid={resolvedParams.organization_uuid}
      email={session?.user?.email ?? ""}
      targetUserId={resolvedParams.user_uuid}
      targetUserName={userName}
      targetUserEmail={userEmail}
    />
  );
}
