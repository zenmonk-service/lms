"use client";

import * as React from "react";
import { CalendarIcon, CircleXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

// Parses a "YYYY-MM-DD" string as a LOCAL date, not UTC. `new Date("2024-01-01")`
// parses as UTC midnight per spec — in some timezones that round-trips to a
// different calendar day once you read it back with local getters, which is
// exactly the kind of mismatch that can defeat the loop-guard below. Parsing
// manually makes formatDate(parseDateOnly(x)) === x always hold, for every timezone.
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

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DateRangePickerProps {
  ref?: React.Ref<HTMLInputElement>;
  setDateRange?: (range: { start_date?: string; end_date?: string }) => void;
  minDate?: Date;
  isDependant?: boolean;
  className?: string;
  containerClassName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  isFromYear?: number;
  disabled?: boolean;
  type?: string;
  maxDays?: number;
}

export function DateRangePicker({
  ref,
  setDateRange,
  minDate,
  isDependant = true,
  className,
  containerClassName,
  initialStartDate,
  initialEndDate,
  isFromYear = 0,
  disabled = false,
  type,
  maxDays,
}: DateRangePickerProps) {
  const [openStart, setOpenStart] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [startMonth, setStartMonth] = React.useState<Date | undefined>();

  const [openEnd, setOpenEnd] = React.useState(false);
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [endMonth, setEndMonth] = React.useState<Date | undefined>();

  const startValue = formatDate(startDate);
  const endValue = formatDate(endDate);

  const today = React.useMemo(() => new Date(), []);
  const maxDate = React.useMemo(
    () =>
      maxDays
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxDays)
        : null,
    [maxDays, today],
  );

  React.useEffect(() => {
    const date = parseDateOnly(initialStartDate);
    setStartDate(date);
    setStartMonth(date);
  }, [initialStartDate]);

  React.useEffect(() => {
    const date = parseDateOnly(initialEndDate);
    setEndDate(date);
    setEndMonth(date);
  }, [initialEndDate]);

  React.useEffect(() => {
    if (type !== "") return;
    setStartDate(undefined);
    setStartMonth(undefined);
    setEndDate(undefined);
    setEndMonth(undefined);
    setDateRange?.({ start_date: "", end_date: "" });
  }, [type]);

  const handleStartSelect = (date?: Date) => {
    setStartDate(date);
    setStartMonth(date);
    setOpenStart(false);

    let nextEndDate = endDate;

    if (type) {
      if (type === LeaveRequestType.SHORT_LEAVE || type === LeaveRequestType.HALF_DAY) {
        nextEndDate = date;
        setEndDate(date);
        setEndMonth(date);
      } else if (type === LeaveRequestType.FULL_DAY) {
        nextEndDate = undefined;
        setEndDate(undefined);
        setEndMonth(undefined);
      }
    }

    setDateRange?.({ start_date: formatDate(date), end_date: formatDate(nextEndDate) });
  };

  const handleEndSelect = (date?: Date) => {
    setEndDate(date);
    setEndMonth(date);
    setOpenEnd(false);
    setDateRange?.({ start_date: formatDate(startDate), end_date: formatDate(date) });
  };

  const clearStart = () => {
    setStartDate(undefined);
    setStartMonth(undefined);
    setEndDate(undefined);
    setEndMonth(undefined);
    setDateRange?.({ start_date: "", end_date: "" });
  };

  const clearEnd = () => {
    setEndDate(undefined);
    setEndMonth(undefined);
    setDateRange?.({ start_date: formatDate(startDate), end_date: "" });
  };

  return (
    <div className={cn("flex gap-2", containerClassName)}>
      <DateField
        ref={ref}
        id="start-date"
        srLabel="Select start date"
        placeholder="Start date"
        value={startValue}
        month={startMonth}
        onMonthChange={setStartMonth}
        selected={startDate}
        open={openStart}
        onOpenChange={setOpenStart}
        onSelect={handleStartSelect}
        onClear={clearStart}
        className={className}
        disabled={disabled}
        isFromYear={isFromYear}
        isDateDisabled={(date) => {
          if (minDate && date < minDate) return true;
          if (endDate && date > endDate) return true;
          if (maxDate && date > maxDate) return true;
          return false;
        }}
      />

      <DateField
        id="end-date"
        srLabel="Select end date"
        placeholder="End date"
        value={endValue}
        month={endMonth}
        onMonthChange={setEndMonth}
        selected={endDate}
        open={openEnd}
        onOpenChange={setOpenEnd}
        onSelect={handleEndSelect}
        onClear={clearEnd}
        className={className}
        disabled={disabled || (isDependant && !startDate)}
        isFromYear={isFromYear}
        isDateDisabled={(date) => {
          if (isDependant && type !== LeaveRequestType.FULL_DAY) {
            return !isSameDay(date, startDate);
          }
          if (startDate) {
            if (date < startDate) return true;
          } else if (minDate && date < minDate) {
            return true;
          }
          if (maxDate && date > maxDate) return true;
          return false;
        }}
      />
    </div>
  );
}

interface DateFieldProps {
  ref?: React.Ref<HTMLInputElement>;
  id: string;
  srLabel: string;
  placeholder: string;
  value: string;
  month?: Date;
  onMonthChange: (date?: Date) => void;
  selected?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (date?: Date) => void;
  onClear: () => void;
  className?: string;
  disabled?: boolean;
  isDateDisabled: (date: Date) => boolean;
  isFromYear: number;
}

function DateField({
  ref,
  id,
  srLabel,
  placeholder,
  value,
  month,
  onMonthChange,
  selected,
  open,
  onOpenChange,
  onSelect,
  onClear,
  className,
  disabled,
  isDateDisabled,
  isFromYear,
}: DateFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <Input
          ref={ref}
          id={id}
          value={value}
          placeholder={placeholder}
          className={cn("pr-10", className)}
          disabled={disabled}
          readOnly
        />
        {value ? (
          <button
            type="button"
            aria-label={`Clear ${placeholder.toLowerCase()}`}
            onClick={onClear}
            className="absolute top-1/2 right-8 -translate-y-1/2 flex items-center justify-center p-1 text-muted-foreground cursor-pointer"
          >
            <CircleXIcon className="h-[14px] w-[14px]" />
          </button>
        ) : null}
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              id={`${id}-picker`}
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">{srLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Calendar
              mode="single"
              selected={selected}
              captionLayout="dropdown"
              month={month}
              onMonthChange={onMonthChange}
              disabled={isDateDisabled}
              onSelect={onSelect}
              fromYear={new Date().getFullYear() - isFromYear}
              toYear={new Date().getFullYear() + 10 + isFromYear}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}