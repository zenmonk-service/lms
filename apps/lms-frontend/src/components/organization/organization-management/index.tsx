"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import OrganizationGrid from "@/components/organization/organization-management/components/grid";
import CreateOrganizationForm from "@/components/organization/organization-management/components/create-orgnization";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { listOrganizationsAction } from "@/features/organizations/list-organizations/list-organization.action";

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
        listOrganizationsAction({
          params: {
            page: 1,
            limit: 10,
            search: trimmed,
          },
        }),
      );
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search, dispatch]);

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

          <Button size={"sm"} onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" />
            Add Organization
          </Button>

          <CreateOrganizationForm
            open={open}
            onOpenChange={setOpen}
            search={search}
          />
        </div>
        <OrganizationGrid search={search} />
      </main>
    </div>
  );
}
