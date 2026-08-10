"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { LeaveRange, LeaveRequestType } from "@/features/leave/leave.types";
import { CaretSortIcon } from "@radix-ui/react-icons";

interface DurationSelectProps {
  type: string;
  range: string;
  onChange: (type: LeaveRequestType, range: LeaveRange) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

const RANGE_LABELS: Record<string, string> = {
  [LeaveRange.FULL_DAY]: "Full Day",
  [LeaveRange.FIRST_HALF]: "First Half",
  [LeaveRange.SECOND_HALF]: "Second Half",
  [LeaveRange.FIRST_QUARTER]: "1st Quarter",
  [LeaveRange.SECOND_QUARTER]: "2nd Quarter",
  [LeaveRange.THIRD_QUARTER]: "3rd Quarter",
  [LeaveRange.FOURTH_QUARTER]: "4th Quarter",
};

const HALF_DAY_RANGES = [LeaveRange.FIRST_HALF, LeaveRange.SECOND_HALF];

const SHORT_LEAVE_RANGES = [
  LeaveRange.FIRST_QUARTER,
  LeaveRange.SECOND_QUARTER,
  LeaveRange.THIRD_QUARTER,
  LeaveRange.FOURTH_QUARTER,
];

export function DurationSelect({
  type,
  range,
  onChange,
  disabled,
  invalid,
  className,
}: DurationSelectProps) {
  const label =
    type === LeaveRequestType.FULL_DAY
      ? "Full Day"
      : type && range
        ? `${type === LeaveRequestType.HALF_DAY ? "Half Day" : "Short Leave"} - ${RANGE_LABELS[range]}`
        : "Select leave duration";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          aria-invalid={invalid}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-medium",
            "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            !type && "text-muted-foreground",
            className,
          )}
        >
          {label}
          <CaretSortIcon className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem
          onSelect={() =>
            onChange(LeaveRequestType.FULL_DAY, LeaveRange.FULL_DAY)
          }
          className="flex items-center justify-between"
        >
          Full Day
          {type === LeaveRequestType.FULL_DAY && (
            <CheckIcon className="size-4 text-primary" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn(
              "flex items-center",
              type === LeaveRequestType.HALF_DAY && "font-medium text-primary",
            )}
          >
            Half Day
            {type === LeaveRequestType.HALF_DAY && (
              <span className="ml-1 mr-1 text-muted-foreground">
                - {RANGE_LABELS[range]}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {HALF_DAY_RANGES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onSelect={() => onChange(LeaveRequestType.HALF_DAY, r)}
                  className="flex items-center justify-between"
                >
                  {RANGE_LABELS[r]}
                  {type === LeaveRequestType.HALF_DAY && range === r && (
                    <CheckIcon className="ml-2 size-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn(
              "flex items-center",
              type === LeaveRequestType.SHORT_LEAVE &&
                "font-medium text-primary",
            )}
          >
            Short Leave
            {type === LeaveRequestType.SHORT_LEAVE && (
              <span className="ml-1 mr-1 text-muted-foreground">
                - {RANGE_LABELS[range]}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {SHORT_LEAVE_RANGES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onSelect={() => onChange(LeaveRequestType.SHORT_LEAVE, r)}
                  className="flex items-center justify-between"
                >
                  {RANGE_LABELS[r]}
                  {type === LeaveRequestType.SHORT_LEAVE && range === r && (
                    <CheckIcon className="ml-2 size-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
