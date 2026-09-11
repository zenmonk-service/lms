import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Scope } from "../utils";

interface IProps {
  search: string;
  onSearchChange: (value: string) => void;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: "negative", label: "Negative only" },
  { value: "all", label: "All balances" },
];

const BalanceFilterBar = ({
  search,
  onSearchChange,
  scope,
  onScopeChange,
}: IProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search leave type…"
        className="h-8 flex-1 min-w-40"
      />
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={scope}
        onValueChange={(value) => value && onScopeChange(value as Scope)}
      >
        {SCOPES.map(({ value, label }) => (
          <ToggleGroupItem key={value} value={value} className="text-xs">
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default BalanceFilterBar;
