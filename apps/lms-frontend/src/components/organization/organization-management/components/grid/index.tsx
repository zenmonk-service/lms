"use client";

import React from "react";
import OrganizationCard from "./card";
import { useAppDispatch, useAppSelector } from "@/store";

import { useRouter } from "next/navigation";
import { setCurrentOrganization } from "@/features/organizations/organizations.slice";
import { PaginationComponent } from "@/shared/pagination";
import { OrgSkeleton } from "../skeleton";
import { listOrganizationsAction } from "@/features/organizations/list-organizations/list-organization.action";
import { Organization } from "@/features/organizations/organizations.types";

export default function OrganizationGrid({ search }: { search: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isLoading, organizations, total, currentPage } = useAppSelector((state) => state.organizationsSlice);
  
  const handleManageMembers = (org: any) => {
    dispatch(setCurrentOrganization(org));
    router.push(`/organizations/${org.uuid}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pr-2 pb-2 max-h-118 overflow-y-auto">
        {isLoading ? (
          <OrgSkeleton />
        ) : (
          organizations.map((org: Organization) => (
            <OrganizationCard
              key={org.id}
              org={org}
              onManageMembers={handleManageMembers}
            />
          ))
        )}
        {organizations.length === 0 && !isLoading && (
          <div className="flex items-center justify-center w-full">
            <p>No organization available</p>
          </div>
        )}
      </div>
      {organizations.length !== 0 && currentPage && total && (
        <PaginationComponent
          total={total}
          currentPage={currentPage}
          pageSize={10}
          onPageChange={function (page: number): void {
            dispatch(
              listOrganizationsAction({ params: { page, limit: 10, search } }),
            );
          }}
        />
      )}
    </div>
  );
}
