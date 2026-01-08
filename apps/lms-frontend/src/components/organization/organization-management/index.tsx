"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import OrganizationGrid from "@/components/organization/organization-management/grid";
import CreateOrganizationForm from "@/components/organization/organization-management/create-orgnization";
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
import { Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toastError } from "@/shared/toast/toast-error";

export default function ManageOrganizations() {
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
  }, [search, dispatch]);

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(createOrganizationAction(data));
      await dispatch(
        getAllOrganizationsAction({ page: 1, limit: 10, search: search })
      );
      setOpen(false);
    } catch (err) {
      toastError("Failed to create organization. Please try again.");
    }
  };

  return (
    <div className=" max-h-[calc(100vh-77px)]">
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 flex flex-col gap-8">
        <h2 className="text-3xl font-bold">Manage organization</h2>

        <div className="flex gap-8 justify-between">
          <InputGroup>
            <InputGroupInput
              required
              id="email"
              type="email"
              value={search}
              onChange={(e) => setSearch(e.target.value as string)}
              placeholder="Search organization..."
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size={"sm"}>
                <Plus className="h-5 w-5" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new Organization</DialogTitle>
              </DialogHeader>
              <CreateOrganizationForm
                onSubmit={handleSubmit}
                onOpenChange={setOpen}
              />
            </DialogContent>
          </Dialog>
        </div>
        <OrganizationGrid search={search} />
      </main>
    </div>
  );
}
