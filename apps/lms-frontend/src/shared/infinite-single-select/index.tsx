"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, CircleX, LoaderCircle } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { type ReactNode, type Ref, useState } from "react";

interface IProps<T> {
  value?: T;
  onValueChange: (value: T | undefined) => void;
  data: T[];
  total: number;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onLoadMore: () => void;
  getValue: (item: T) => string;
  getLabel: (item: T) => ReactNode;
  placeholder?: string;
  clearable?: boolean;
  ref?: Ref<HTMLButtonElement>;
  "aria-invalid"?: boolean;
  className?: string;
  onReset?: () => void;
}

export const InfiniteSingleSelect = <T,>({
  value,
  onValueChange,
  data,
  total,
  isLoading,
  onSearch,
  onLoadMore,
  getValue,
  getLabel,
  placeholder = "Select option",
  clearable = false,
  ref,
  "aria-invalid": ariaInvalid,
  className,
  onReset,
}: IProps<T>) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            ref={ref}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-between text-sm font-medium placeholder:text-muted-foreground",
              clearable && value && "pr-8",
              className,
            )}
          >
            <span className="truncate">{value ? getLabel(value) : placeholder}</span>
            {!(clearable && value) && (
              <CaretSortIcon className="size-4 shrink-0 opacity-50" />
            )}
          </Button>
          {clearable && value && (
            <CircleX
              className="absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-pointer opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onValueChange(undefined);
                onReset && onReset();
              }}
            />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={searchTerm}
            onValueChange={(v) => {
              setSearchTerm(v);
              onSearch(v);
            }}
          />

          <CommandList>
            <div id="infinite-scroll-list" className="max-h-62.5 overflow-y-auto">
              {!isLoading && data.length === 0 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}

              <InfiniteScroll
                dataLength={data.length}
                next={onLoadMore}
                hasMore={data.length < total}
                loader={<LoaderCircle className="mx-auto my-2 animate-spin size-3" />}
                scrollableTarget="infinite-scroll-list"
              >
                <CommandGroup>
                  {data.map((item) => {
                    const itemValue = getValue(item);
                    const isSelected = value != null && getValue(value) === itemValue;
                    return (
                      <CommandItem
                        key={itemValue}
                        value={itemValue}
                        onSelect={() => {
                          onValueChange(isSelected ? undefined : item);
                          setOpen(false);
                        }}
                        >
                        <span className="truncate">{getLabel(item)}</span>
                        <Check
                          className={cn(
                            "ml-auto mr-1 size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </InfiniteScroll>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};