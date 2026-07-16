import { SiteHeader } from "@/components/layout/app-bar/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "../auth/get-auth.action";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar/app-sidebar";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organization_uuid: string }>;
}) {
  const { organization_uuid } = await params;

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }
  if (session && session.user.org_uuid !== organization_uuid) {
    redirect("/select-organization");
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar uuid={organization_uuid} />
          <div className="flex flex-col flex-1 overflow-auto">
            <SiteHeader />
            <main className="overflow-auto">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
