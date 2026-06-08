"use client";

import * as React from "react";
import { CalendarIcon, CircleXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LeaveRequestType } from "@/features/leave/leave.types";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

interface DateRangePickerProps {
  ref?: React.Ref<any>;
  setDateRange?: React.Dispatch<
    React.SetStateAction<{ start_date?: string; end_date?: string }>
  >;
  minDate?: Date;
  isDependant?: boolean;
  className?: string;
  containerClassName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  isFromYear?: Number;
  disabled?: boolean;
  type?: string;
  maxDays?: number;
  label?: "edit" | "create";
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
  label = "create",
}: DateRangePickerProps) {
  const [openStart, setOpenStart] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [startMonth, setStartMonth] = React.useState<Date | undefined>();
  const [startValue, setStartValue] = React.useState("");

  const [openEnd, setOpenEnd] = React.useState(false);
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [endMonth, setEndMonth] = React.useState<Date | undefined>();
  const [endValue, setEndValue] = React.useState("");

  const today = new Date();
  const maxDate = maxDays
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxDays)
    : null;

  React.useEffect(() => {
    if (initialStartDate) {
      const date = new Date(initialStartDate);
      if (isValidDate(date)) {
        setStartDate(date);
        setStartMonth(date);
        setStartValue(formatDate(date));
      }
    } else {
      setStartDate(undefined);
      setStartMonth(undefined);
      setStartValue("");
    }
  }, [initialStartDate]);

  React.useEffect(() => {
    if (initialEndDate) {
      const date = new Date(initialEndDate);
      if (isValidDate(date)) {
        setEndDate(date);
        setEndMonth(date);
        setEndValue(formatDate(date));
      }
    } else {
      setEndDate(undefined);
      setEndMonth(undefined);
      setEndValue("");
    }
  }, [initialEndDate]);

  React.useEffect(() => {
    if (setDateRange) {
      setDateRange({
        start_date: startValue ?? "",
        end_date: endValue ?? "",
      });
    }
  }, [startValue, endValue]);

  const handleDateSelect = (date?: Date) => {
    if (typeof type === "undefined") return;

    if (
      type === LeaveRequestType.SHORT_LEAVE ||
      type === LeaveRequestType.HALF_DAY
    ) {
      setEndDate(date);
      setEndValue(formatDate(date));
    } else if (type === LeaveRequestType.FULL_DAY) {
      setEndDate(undefined);
      setEndMonth(undefined);
      setEndValue("");
    } else {
      setStartDate(undefined);
      setStartMonth(undefined);
      setStartValue("");

      setEndDate(undefined);
      setEndMonth(undefined);
      setEndValue("");
    }
  };

  React.useEffect(() => {
    if (typeof type === "undefined") return;

    if (type === "") {
      setStartDate(undefined);
      setStartMonth(undefined);
      setStartValue("");

      setEndDate(undefined);
      setEndMonth(undefined);
      setEndValue("");
    }
  }, [type]);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-2", containerClassName)}>
      <div className="flex flex-col gap-3">
        <div className="relative flex gap-2">
          <Input
            ref={ref}
            id="start-date"
            value={startValue}
            placeholder="Start date"
            className={cn("pr-10", className)}
            disabled={disabled}
            readOnly
          />
          {startValue ? (
            <button
              type="button"
              aria-label="Clear start date"
              onClick={() => {
                setStartValue("");
                setStartDate(undefined);
                setStartMonth(undefined);
                if (setDateRange)
                  setDateRange({ start_date: "", end_date: "" });
                if (endDate) {
                  setEndDate(undefined);
                  setEndValue("");
                  setEndMonth(undefined);
                }
              }}
              className="absolute top-1/2 right-8 -translate-y-1/2 flex items-center justify-center p-1 text-muted-foreground cursor-pointer"
            >
              <CircleXIcon className="h-[14px] w-[14px]" />
            </button>
          ) : null}
          <Popover open={openStart} onOpenChange={setOpenStart}>
            <PopoverTrigger asChild>
              <Button
                id="start-date-picker"
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                disabled={disabled}
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select start date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={startDate}
                captionLayout="dropdown"
                month={startMonth}
                onMonthChange={setStartMonth}
                disabled={(date: Date) => {
                  if (minDate && date < minDate) return true;
                  if (endDate && date > endDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartValue(formatDate(date));
                  setOpenStart(false);
                  handleDateSelect(date);
                }}
                fromYear={new Date().getFullYear() - Number(isFromYear)}
                toYear={new Date().getFullYear() + 10 + Number(isFromYear)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex gap-2">
          <Input
            id="end-date"
            value={endValue}
            placeholder="End date"
            className={cn("pr-10", className)}
            readOnly
            disabled={disabled || (isDependant && !startDate)}
          />
          {endValue ? (
            <button
              type="button"
              aria-label="Clear end date"
              onClick={() => {
                setEndValue("");
                setEndDate(undefined);
                setEndMonth(undefined);
                if (setDateRange)
                  setDateRange({ start_date: startValue, end_date: "" });
              }}
              className="absolute top-1/2 right-8 -translate-y-1/2 flex items-center justify-center p-1 text-muted-foreground cursor-pointer"
            >
              <CircleXIcon className="h-[14px] w-[14px]" />
            </button>
          ) : null}
          <Popover open={openEnd} onOpenChange={setOpenEnd}>
            <PopoverTrigger
              asChild
              disabled={disabled || (isDependant && !startDate)}
            >
              <Button
                id="end-date-picker"
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select end date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={endDate}
                captionLayout="dropdown"
                month={endMonth}
                onMonthChange={setEndMonth}
                disabled={(date: Date) => {
                  if (isDependant && type !== LeaveRequestType.FULL_DAY) {
                    return formatDate(date) !== formatDate(startDate);
                  }

                  if (startDate) {
                    if (date < startDate) return true;
                  } else if (minDate) {
                    if (date < minDate) return true;
                  }

                  if (maxDate && date > maxDate) return true;

                  return false;
                }}
                onSelect={(date) => {
                  setEndDate(date);
                  setEndValue(formatDate(date));
                  setOpenEnd(false);
                }}
                fromYear={new Date().getFullYear() - Number(isFromYear)}
                toYear={new Date().getFullYear() + 10 + Number(isFromYear)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
