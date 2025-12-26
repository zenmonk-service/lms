"use client";

import React, { useEffect, useState } from "react";
import { Building2, Globe, LoaderCircle, SearchIcon } from "lucide-react";
import AppBar from "@/components/app-bar";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getOrganizationUserDataAction,
  getOrganizationsAction,
} from "@/features/organizations/organizations.action";
import { useRouter } from "next/navigation";
import { getSession } from "../auth/get-auth.action";
import { listUserAction } from "@/features/user/user.action";
import { Organization, setCurrentOrganization } from "@/features/organizations/organizations.slice";
import { useSession } from "next-auth/react";
import { SelectOrganizationLoadingSkeleton } from "./loading-skeleton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PaginationComponent } from "@/shared/pagination";

function App() {
  const { isOrgLoading, organizations, currentPage, count, total } =
    useAppSelector((state) => state.organizationsSlice);
  const { update } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  async function getSessionData() {
    setSessionData(await getSession());
  }

  useEffect(() => {
    getSessionData();
    if (sessionData?.user?.uuid) {
      dispatch(
        getOrganizationsAction({
          uuid: sessionData?.user?.uuid,
          page: 1,
          limit: 9,
          search,
        })
      );
    }
  }, [sessionData?.user?.uuid, search]);

  const handleOrgSelect = async (org: Organization) => {
    try {
      setLoading(true);
      await dispatch(
        getOrganizationUserDataAction({
          organizationId: org.uuid,
          email: sessionData?.user?.email || "",
        })
      );

      dispatch(setCurrentOrganization(org));
      dispatch(
        listUserAction({
          org_uuid: org.uuid,
          pagination: { page: 1, limit: 10, search: sessionData?.user?.email },
          isCurrentUser: true,
        })
      );
      await update({ org_uuid: org.uuid });
      setLoading(false);
      router.push(`/${org.uuid}/dashboard`);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-sm p-8 flex flex-col items-center gap-4 shadow-xl">
            <LoaderCircle className="w-12 h-12 text-orange-500 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                Loading workspace...
              </p>
              <p className="text-sm text-gray-600">
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
            <p className="text-3xl font-bold">Select workspace</p>
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
            {isOrgLoading ? (
              <SelectOrganizationLoadingSkeleton />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <div
                    key={org.uuid}
                    className="p-4 border border-border rounded-sm hover:bg-muted/20 cursor-pointer"
                    onClick={() => handleOrgSelect(org)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{org.name}</p>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <p className="text-xs">{org.domain}</p>
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
                  getOrganizationsAction({
                    uuid: sessionData?.user?.uuid,
                    page,
                    limit: 9,
                    search,
                  })
                );
              }}
              showSummary={false}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">Can't find your workspace?</p>
            <span className="text-orange-600 font-medium transition-colors">
              Contact your admin to get access to an organization
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
