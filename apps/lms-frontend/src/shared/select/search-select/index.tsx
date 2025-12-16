"use client";

import * as React from "react";
import { ChevronsUpDown, LoaderCircle, CircleX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";

interface SearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (search: string) => void;
  data: any[];
  placeholder?: string;
  label?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  displayKey?: string;
  valueKey?: string;
}

export function SearchSelect({
  value,
  onValueChange,
  onSearch,
  data = [],
  placeholder = "Select...",
  label = "Items",
  className = "w-[200px]",
  isLoading = false,
  disabled = false,
  emptyMessage = "No items found.",
  displayKey = "name",
  valueKey = "user_id",
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();

    const handler = setTimeout(() => {
      onSearch(trimmedSearchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  const selectedItem = data.find((item) => item[valueKey] === value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between text-sm w-full pr-10 hover:bg-transparent",
              selectedItem
                ? "hover:text-current"
                : "text-muted-foreground hover:text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {selectedItem ? selectedItem[displayKey] : placeholder}
          </Button>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {value ? (
              <CircleX
                className="h-4 w-4 opacity-50 cursor-pointer hover:opacity-100"
                onClick={handleClear}
              />
            ) : (
              <CaretSortIcon height={16} width={16} className="opacity-50" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className)}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${label.toLowerCase()}...`}
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoaderCircle className="animate-spin h-4 w-4" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {data.map((item, index) => (
                    <CommandItem
                      key={item[valueKey] || index}
                      value={item[displayKey]}
                      onSelect={() => {
                        const selectedValue = item[valueKey];
                        onValueChange(
                          selectedValue === value ? "" : selectedValue
                        );
                        setOpen(false);
                      }}
                    >
                      {item[displayKey]}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
