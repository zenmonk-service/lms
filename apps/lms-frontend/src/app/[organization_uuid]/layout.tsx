import AppBar from "@/components/app-bar";
import { AppSidebar } from "@/components/layout/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "../auth/get-auth.action";
import { redirect } from "next/navigation";

export default async function Layout({ children, params }: any) {
  const resolvedParams = await Promise.resolve(params);
  const organization_uuid = Array.isArray(resolvedParams.organization_uuid)
    ? resolvedParams.organization_uuid[0]
    : resolvedParams.organization_uuid;
  const session = await getSession();
  if (session && session.user.org_uuid !== organization_uuid) {
    redirect("/select-organization");
  }

  return (
    <div className="h-screen flex flex-col">
      {/* <AppBar /> */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar uuid={organization_uuid} />
          <div className="flex flex-col flex-1 overflow-auto">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
