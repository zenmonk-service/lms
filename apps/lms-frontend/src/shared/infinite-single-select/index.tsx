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
import { UserInterface } from "@/features/user/user.type";

interface IProps<T> {
  value?: UserInterface;
  onValueChange: (value: UserInterface) => void;
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
  T extends UserInterface,
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
          {value?.name ?? placeholder}

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
                        onValueChange(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.user_id === item.user_id ? "opacity-100" : "opacity-0",
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
