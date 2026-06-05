
import LoginPage from '@/components/login'

export default async function OrganizationLogin({ params }: { params: { organization_uuid: string } }) {
    const { organization_uuid } = await params;
  return (
    <LoginPage organization_uuid={organization_uuid}/>
  )
}
