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
  initialStartDate?: string;
  initialEndDate?: string;
  onReset?: () => void;
}

export function DateRangePicker({
  ref,
  setDateRange,
  minDate,
  isDependant = true,
  className,
  initialStartDate,
  initialEndDate,
  onReset,
}: DateRangePickerProps) {
  const [openStart, setOpenStart] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [startMonth, setStartMonth] = React.useState<Date | undefined>();
  const [startValue, setStartValue] = React.useState("");

  const [openEnd, setOpenEnd] = React.useState(false);
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [endMonth, setEndMonth] = React.useState<Date | undefined>();
  const [endValue, setEndValue] = React.useState("");

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
  }, [startValue, endValue, setDateRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div className="flex flex-col gap-3">
        <div className="relative flex gap-2">
          <Input
            ref={ref}
            id="start-date"
            value={startValue}
            placeholder="Start date"
            className={cn("bg-background pr-10", className)}
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
                if (isDependant && endDate) {
                  setEndDate(undefined);
                  setEndValue("");
                  setEndMonth(undefined);
                }
                if (onReset) {
                  onReset();
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
                disabled={(date: Date) => (minDate ? date < minDate : endDate ? date > endDate : false)}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartValue(formatDate(date));
                  setOpenStart(false);
                  onReset && onReset();
                }}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 10}
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
            className={cn("bg-background pr-10", className)}
            readOnly
            disabled={isDependant && !startDate}
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
                if (onReset) {
                  onReset();
                }
              }}
              className="absolute top-1/2 right-8 -translate-y-1/2 flex items-center justify-center p-1 text-muted-foreground cursor-pointer"
            >
              <CircleXIcon className="h-[14px] w-[14px]" />
            </button>
          ) : null}
          <Popover open={openEnd} onOpenChange={setOpenEnd}>
            <PopoverTrigger asChild disabled={isDependant && !startDate}>
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
                disabled={(date: Date) =>
                  startDate
                    ? date < startDate
                    : minDate
                    ? date < minDate
                    : false
                }
                onSelect={(date) => {
                  setEndDate(date);
                  setEndValue(formatDate(date));
                  setOpenEnd(false);
                  onReset && onReset();
                }}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 10}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
