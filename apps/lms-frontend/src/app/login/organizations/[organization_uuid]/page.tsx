import LoginPage from "@/components/login";
interface PageProps {
  readonly params: Promise<{
    organization_uuid: string;
  }>;
}

export default async function OrganizationLogin({ params }: PageProps) {
  const { organization_uuid } = await params;
  return <LoginPage organization_uuid={organization_uuid} />;
}
