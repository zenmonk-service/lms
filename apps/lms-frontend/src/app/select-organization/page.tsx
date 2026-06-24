"use client";

import { useEffect, useState } from "react";
import { Globe, LoaderCircle, SearchIcon } from "lucide-react";
import AppBar from "@/components/app-bar";
import { useAppDispatch, useAppSelector } from "@/store";
import { useRouter } from "next/navigation";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import { setCurrentOrganization } from "@/features/organizations/organizations.slice";
import { useSession } from "next-auth/react";
import { SelectOrganizationLoadingSkeleton } from "./loading-skeleton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PaginationComponent } from "@/shared/pagination";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { listUserOrganizationsAction } from "@/features/organizations/list-user-organizations/list-user-organizations.action";
import { Organization } from "@/features/organizations/organizations.types";
import { loginOrganizationAction } from "@/features/organizations/login-organization/login-organization.action";

function App() {
  const router = useRouter();
  const { update } = useSession();

  const { isOrgLoading, organizations, currentPage, total } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    dispatch(
      listUserOrganizationsAction({
        uuid: currentUser.user_id,
        params: {
          page: 1,
          limit: 10,
          search,
        },
      }),
    );
  }, [search]);

  const handleOrgSelect = async (org: Organization) => {
    try {
      setLoading(true);
      const userDataResponse = await dispatch(
        loginOrganizationAction({
          org_uuid: org.uuid,
          email: currentUser.email,
        }),
      ).unwrap();

      const normalizedCurrentUser: UserInterface = {
        user_id:
          userDataResponse?.user_id ||
          userDataResponse?.uuid ||
          String(userDataResponse?.id || ""),
        name: userDataResponse?.name || "",
        email: userDataResponse?.email || "",
        role: {
          id: String(userDataResponse?.role?.id || ""),
          uuid: userDataResponse?.role?.uuid || "",
          name: userDataResponse?.role?.name || "",
          description: userDataResponse?.role?.description || "",
        },
        organization_shift: {
          uuid: userDataResponse?.organization_shift?.uuid || "",
          name: userDataResponse?.organization_shift?.name || "",
          start_time: userDataResponse?.organization_shift?.start_time || "",
          end_time: userDataResponse?.organization_shift?.end_time || "",
          effective_hours:
            userDataResponse?.organization_shift?.effective_hours || 0,
        },
        is_active: Boolean(userDataResponse?.is_active),
        created_at: userDataResponse?.created_at || "",
        image: userDataResponse?.image || "",
        documents: userDataResponse?.documents || [],
      };

      dispatch(setCurrentOrganization(org));
      dispatch(setCurrentUser(normalizedCurrentUser));
      await update({
        org_uuid: org.uuid,
        name: normalizedCurrentUser.name,
        email: normalizedCurrentUser.email,
        image: normalizedCurrentUser.image || null,
        role: normalizedCurrentUser.role,
        organization_shift: normalizedCurrentUser.organization_shift,
      });
      setLoading(false);
      router.push(`/${org.uuid}/dashboard`);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-background-blur backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-sm p-8 flex flex-col items-center gap-4 shadow-xl">
            <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold">Loading workspace...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we set up your environment
              </p>
            </div>
          </div>
        </div>
      )}
      <AppBar />
      <div className="flex-1 flex justify-center">
        <div className="w-11/12 lg:w-3/4 py-6 px-4 flex flex-col gap-4">
          <div className="flex flex-col">
            <p
              className="text-3xl font-bold"
              style={{ wordBreak: "break-word" }}
            >
              Select workspace
            </p>
            <p className="text-xs text-muted-foreground">
              Select the organization you'd like to work in. You can always
              switch between workspaces later.
            </p>
          </div>

          <InputGroup className="rounded-sm shadow-none">
            <InputGroupInput
              placeholder="Search organizations..."
              className="text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <div className="flex-1">
            {isOrgLoading && <SelectOrganizationLoadingSkeleton />}

            {!isOrgLoading && organizations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No organization found...
              </p>
            )}

            {!isOrgLoading && organizations.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <div
                    key={org.uuid}
                    className="p-4 border border-border rounded-sm bg-card cursor-pointer"
                    onClick={() => handleOrgSelect(org)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="rounded-none">
                        <AvatarImage
                          src={org.logo_url || "https://github.com/shadcn.png"}
                          alt={`Logo of ${org.name}`}
                          className="object-cover"
                        />
                      </Avatar>
                      <div>
                        <p className="font-semibold wrap-break-word">
                          {org.name}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <p className="text-xs wrap-break-word">
                            {org.domain}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <PaginationComponent
              total={total}
              currentPage={currentPage}
              pageSize={9}
              onPageChange={function (page: number): void {
                dispatch(
                  listUserOrganizationsAction({
                    uuid: currentUser.user_id,
                    params: {
                      page,
                      limit: 10,
                      search,
                    },
                  }),
                );
              }}
              showSummary={false}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Can't find your workspace?
            </p>
            <span className="text-primary font-medium transition-colors">
              Contact your admin to get access to an organization
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
