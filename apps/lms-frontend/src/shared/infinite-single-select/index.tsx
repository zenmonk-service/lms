"use client";

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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { RefCallBack } from "react-hook-form";
import { useState } from "react";

interface IProps<T> {
  value?: string;
  onValueChange: (value: string) => void;
  data: T[];
  total: number;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onLoadMore: () => void;
  placeholder?: string;
  ref?: RefCallBack;
  ariaInvalid?: boolean;
}

export const InfiniteSingleSelect = <
  T extends { user_id: string; name: string; email: string },
>({
  value,
  onValueChange,
  data,
  total,
  isLoading,
  onSearch,
  onLoadMore,
  placeholder = "Select option",
  ref,
  ariaInvalid,
}: IProps<T>) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedItem = data.find((item) => item.user_id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className="w-full justify-between font-normal"
        >
          {selectedItem?.name ?? placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              onSearch(value);
            }}
          />

          <CommandList>
            <div
              id="infinite-scroll-list"
              className="max-h-[250px] overflow-y-auto"
            >
              <CommandEmpty>No results found.</CommandEmpty>

              <InfiniteScroll
                dataLength={data.length}
                next={onLoadMore}
                hasMore={data.length < total}
                loader={<LoaderCircle className="mx-auto my-2 animate-spin" />}
                scrollableTarget="infinite-scroll-list"
              >
                <CommandGroup>
                  {data.map((item) => (
                    <CommandItem
                      key={item.user_id}
                      value={item.user_id}
                      onSelect={() => {
                        onValueChange(item.user_id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.user_id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {item.name} ({item.email})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </InfiniteScroll>
            </div>
          </CommandList>

          {isLoading && data.length === 0 && (
            <div className="flex justify-center py-4">
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
