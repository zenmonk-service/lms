"use client";

import * as React from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { CalendarIcon, CircleXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LeaveRequestType } from "@/features/leave/leave.types";

function formatDate(date?: Date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isValidDate(date: Date): date is Date {
  return !isNaN(date.getTime());
}

// Parses a "YYYY-MM-DD" string as a LOCAL date, not UTC — keeps
// formatDate(parseDateOnly(x)) === x true in every timezone.
function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isValidDate(date) ? date : undefined;
  }
  const fallback = new Date(value);
  return isValidDate(fallback) ? fallback : undefined;
}

interface DateRangePickerProps {
  ref?: React.Ref<HTMLButtonElement>;
  setDateRange?: (range: { start_date?: string; end_date?: string }) => void;
  minDate?: Date;
  className?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  isFromYear?: number;
  disabled?: boolean;
  invalid?: boolean;
  type?: string;
  maxDays?: number;
}

export function DateRangePicker({
  ref,
  setDateRange,
  minDate,
  className,
  initialStartDate,
  initialEndDate,
  isFromYear = 0,
  disabled = false,
  type,
  maxDays,
  invalid = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>();

  const isSingleDay =
    type === LeaveRequestType.HALF_DAY || type === LeaveRequestType.SHORT_LEAVE;

  const today = React.useMemo(() => new Date(), []);
  const maxDate = React.useMemo(
    () =>
      maxDays
        ? new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + maxDays,
          )
        : null,
    [maxDays, today],
  );

  React.useEffect(() => {
    const from = parseDateOnly(initialStartDate);
    const to = parseDateOnly(initialEndDate);
    setRange(from ? { from, to: to ?? from } : undefined);
  }, [initialStartDate, initialEndDate]);

  React.useEffect(() => {
    if (type !== "") return;
    setRange(undefined);
    setDateRange?.({ start_date: "", end_date: "" });
  }, [type]);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleSingleSelect = (date?: Date) => {
    setRange(date ? { from: date, to: date } : undefined);
    setDateRange?.({
      start_date: formatDate(date),
      end_date: formatDate(date),
    });
    setOpen(false);
  };

  const handleRangeSelect = (next?: DateRange) => {
    setRange(next);
    if (next?.from && next?.to) {
      setDateRange?.({
        start_date: formatDate(next.from),
        end_date: formatDate(next.to),
      });
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRange(undefined);
    setDateRange?.({ start_date: "", end_date: "" });
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn(
              "w-full justify-start px-2.5 font-normal",
              "border bg-background shadow-xs dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
              !range?.from && "text-muted-foreground",
              range?.from && "pr-8",
              className,
            )}
          >
            <CalendarIcon />
            {range?.from ? (
              range.to && range.to.getTime() !== range.from.getTime() ? (
                <span className="mr-6">
                  {format(range.from, "LLL dd, y")} -{" "}
                  {format(range.to, "LLL dd, y")}
                </span>
              ) : (
                <span className="mr-6">{format(range.from, "LLL dd, y")}</span>
              )
            ) : (
              <span>{isSingleDay ? "Select date" : "Select date range"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {isSingleDay ? (
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={range?.from}
              onSelect={handleSingleSelect}
              disabled={isDateDisabled}
              fromYear={today.getFullYear() - isFromYear}
              toYear={today.getFullYear() + 10 + isFromYear}
            />
          ) : (
            <Calendar
              mode="range"
              captionLayout="dropdown"
              numberOfMonths={2}
              defaultMonth={range?.from}
              selected={range}
              onSelect={handleRangeSelect}
              disabled={isDateDisabled}
              fromYear={today.getFullYear() - isFromYear}
              toYear={today.getFullYear() + 10 + isFromYear}
            />
          )}
        </PopoverContent>
      </Popover>

      {range?.from && !disabled && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={clear}
          className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center p-1 text-muted-foreground hover:text-foreground"
        >
          <CircleXIcon className="h-[14px] w-[14px]" />
        </button>
      )}
    </div>
  );
}
