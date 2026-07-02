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
    <div className="flex justify-between flex-wrap">
      <Title
        title={{
          text: "Organizations",
        }}
        description={{
          text: "Manage and oversee all organizations within the LMS platform.",
        }}
        className="mb-0"
      />
      <div className="flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            value={search}
            className="w-64"
            placeholder={"Search organizations by name..."}
            onChange={(event) => setSearch(event.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <Button size="sm" onClick={onAddOrg}>
          <Plus className="size-3.5" />
          Add Org
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
