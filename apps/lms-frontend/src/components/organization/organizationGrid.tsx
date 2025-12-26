"use client";

import React from "react";
import OrganizationCard from "./organizationCard";
import { useAppDispatch, useAppSelector } from "@/store";

import LoadingSkelton from "./loadingSkelton";
import { getAllOrganizationsAction } from "@/features/organizations/organizations.action";
import { useRouter } from "next/navigation";
import { Organization, setCurrentOrganization } from "@/features/organizations/organizations.slice";
import { PaginationComponent } from "@/shared/pagination";

export default function OrganizationGrid({ search }: { search: string }) {
  const router = useRouter();

  const { isLoading, organizations, total, currentPage } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();
  const handleManageMembers = (org: any) => {
    dispatch(setCurrentOrganization(org));
    router.push(`/organizations/${org.uuid}`);
  };

  const handleEdit = (org: any) => {
    console.log("Edit clicked for", org);
  };

  const handleDelete = (org: any) => {
    console.log("Delete clicked for", org);
  };

  return (
    <div className="flex flex-col gap-8">
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pr-2 pb-2 max-h-[472px] overflow-y-auto"
      >
        {isLoading ? (
          <LoadingSkelton />
        ) : (
          organizations.map((org:Organization) => (
            <OrganizationCard
              key={org.id}
              org={org}
              onManageMembers={handleManageMembers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
        {organizations.length === 0 && !isLoading && (
          <div className="flex items-center justify-center w-full">
            <p className="text-center w-full">No organization available</p>
          </div>
        )}
      </div>
      {organizations.length !== 0 && currentPage && total && (
        <PaginationComponent
          total={total}
          currentPage={currentPage}
          pageSize={10}
          onPageChange={function (page: number): void {
            dispatch(getAllOrganizationsAction({ page, limit: 10, search }));
          }}
        />
      )}
    </div>
  );
}
