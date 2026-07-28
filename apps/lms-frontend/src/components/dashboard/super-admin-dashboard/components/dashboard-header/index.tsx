import Title from "@/shared/typography/title";
import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface IProps {
  search: string;
  setSearch: (value: string) => void;
  onAddOrg: () => void;
}

const DashboardHeader = ({ search, setSearch, onAddOrg }: IProps) => {
  return (
    <div className="flex justify-between flex-wrap gap-4">
      <Title
        title={{ text: "Organizations" }}
        description={{ text: "Manage and oversee all organizations within the IBMS platform." }}
        className="mb-0"
      />
      <div className="flex-1 flex items-center gap-2 justify-end">
        <InputGroup className="sm:max-w-74 flex-1">
          <InputGroupInput
            value={search}
            placeholder={"Search organizations by name"}
            onChange={(event) => setSearch(event.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <Button size="sm" onClick={onAddOrg}>
          <Plus className="size-3.5" />
          <span className="hidden sm:block">Add Org</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
