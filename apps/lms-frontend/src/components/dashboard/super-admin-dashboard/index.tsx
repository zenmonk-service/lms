"use client";

import { useDebounce } from "@/shared/hooks/use-debounce";
import React, { useState } from "react";
import useOrganizationData from "./hooks/use-organization-data";
import CreateOrganizationForm from "@/components/organization/organization-management/components/create-orgnization";
import DashboardHeader from "./components/dashboard-header";
import OrganizationCard from "./components/organization-card";

const SuperAdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);
  const { organizations, isLoading } = useOrganizationData({ search: debouncedSearch });

  const onAddOrg = () => setOpen(true);

  return (
    <div className="space-y-8">
      <DashboardHeader
        search={search}
        setSearch={setSearch}
        onAddOrg={onAddOrg}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>

      <CreateOrganizationForm open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default SuperAdminDashboard;
