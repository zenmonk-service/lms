"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  allowFutureDates?: boolean;
  maxDate?: Date;
  captionLayout?: "label" | "dropdown";
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  setDate,
  className,
  disabled = false,
  placeholder = "Pick a date",
  allowFutureDates = true,
  maxDate,
  captionLayout = "dropdown",
  fromYear,
  toYear,
}: DatePickerProps) {
  const calendarMaxDate =
    maxDate ?? (allowFutureDates ? undefined : new Date());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            "max-w-55 justify-start text-left text-sm font-medium data-[empty=true]:text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          disabled={calendarMaxDate ? { after: calendarMaxDate } : undefined}
          mode="single"
          selected={date}
          defaultMonth={date ?? calendarMaxDate}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          onSelect={(date) => {
            setDate(date);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
