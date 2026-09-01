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
}

export function DatePicker({
  date,
  setDate,
  className,
  disabled = false,
  placeholder = "Pick a date",
  allowFutureDates = true,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            "max-w-[220px] justify-start text-left text-sm font-medium data-[empty=true]:text-muted-foreground",
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
          disabled={allowFutureDates ? undefined : { after: new Date() }}
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          onSelect={(date) => { setDate(date); }}
        />
      </PopoverContent>
    </Popover>
  );
}
