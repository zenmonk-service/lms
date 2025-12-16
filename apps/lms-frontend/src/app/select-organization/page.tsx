"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Building2, LoaderCircle } from "lucide-react";
import AppBar from "@/components/app-bar";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getOrganizationById,
  getOrganizationsAction,
} from "@/features/organizations/organizations.action";
import { useRouter } from "next/navigation";
import { getSession } from "../auth/get-auth.action";
import { listUserAction } from "@/features/user/user.action";
import { Organization } from "@/features/organizations/organizations.slice";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { SelectOrganizationLoadingSkeleton } from "./loading-skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "@/components/ui/skeleton";
import { setUserCurrentOrganization } from "@/features/user/user.slice";

function App() {
  const { isOrgLoading, organizations, currentPage, count } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const { data, update } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

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
          limit: 10,
        })
      );
    }
  }, [sessionData?.user?.uuid]);

  const handleOrgSelect = async (org: Organization) => {
    try {
      setLoading(true);
      await dispatch(
        getOrganizationById({
          organizationId: org.uuid,
          email: sessionData?.user?.email || "",
        })
      );

      dispatch(setUserCurrentOrganization(org));
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

  const loadMore = async () => {
    if (!sessionData?.user?.uuid) return;
    try {
      setIsLoadingMore(true);
      await dispatch(
        getOrganizationsAction({
          uuid: sessionData?.user?.uuid,
          page: currentPage + 1,
          limit: 10,
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingMore(false);
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
        <div className="lg:w-1/2 w-11/12 py-6 px-4 flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <p className="text-4xl font-bold">Choose your workspace</p>
            <p className="text-sm text-gray-600 max-w-2xl">
              Select the organization you'd like to work in. You can always
              switch between workspaces later.
            </p>
          </div>

          <div className="border-x border-[#ddd]">
            <div className="h-4" />
            <div
              id="scrollableDiv"
              className="max-h-[575px] overflow-y-auto no-scrollbar"
            >
              {isOrgLoading && !organizations.length ? (
                <SelectOrganizationLoadingSkeleton />
              ) : (
                <InfiniteScroll
                  dataLength={organizations.length}
                  hasMore={organizations.length < count}
                  next={loadMore}
                  loader={
                    isLoadingMore && (
                      <div className="p-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="w-5 h-5" />
                            </div>
                            <Skeleton className="h-3 w-32 mt-1" />
                          </div>
                        </div>
                      </div>
                    )
                  }
                  scrollableTarget="scrollableDiv"
                  className="space-y-0"
                >
                  {organizations.map((org: Organization, index: number) => (
                    <React.Fragment key={org.id}>
                      {index === 0 && <Separator />}
                      <div
                        onClick={() => handleOrgSelect(org)}
                        className="bg-[#fcfcfc] p-2 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex flex-col flex-1">
                            <p className="font-semibold">{org.name}</p>
                            <div className="h-[1px] bg-[#eee] group-hover:bg-orange-500 transition-all duration-300 ease-in-out" />
                            <p className="text-xs text-gray-600">
                              {org.domain}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </React.Fragment>
                  ))}
                </InfiniteScroll>
              )}
            </div>
            <div className="h-4" />
          </div>

          <div className="text-center mt-auto">
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
