"use client";

import React, { useEffect, useState } from "react";

import AppBar from "@/components/app-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrganizationGrid from "@/components/organization/organizationGrid";
import CreateOrganizationForm from "@/components/organization/createOrganization";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import {
  createOrganizationAction,
  getAllOrganizationsAction,
} from "@/features/organizations/organizations.action";
import { Plus } from "lucide-react";

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState<string>("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed.length === 0 && search.length > 0) {
        return;
      }
      dispatch(
        getAllOrganizationsAction({
          page: 1,
          limit: 10,
          search: trimmed,
        })
      );
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(createOrganizationAction(data));
      await dispatch(
        getAllOrganizationsAction({ page: 1, limit: 10, search: search })
      );
      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className=" max-h-[calc(100vh-77px)] h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 flex flex-col gap-8">
        <div className="text-center ">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Manage organization
          </h2>
        </div>

        <div className="flex gap-8 justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value as string)}
            className="border-0 bg-white outline-0 max-w-md"
            placeholder="Search organization..."
          ></Input>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size={"sm"}  className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-5 w-5" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Create a new Organization</DialogTitle>
              </DialogHeader>
              <CreateOrganizationForm onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <OrganizationGrid search={search} />
        </div>
      </main>
      <div></div>
    </div>
  );
}

export default Dashboard;
