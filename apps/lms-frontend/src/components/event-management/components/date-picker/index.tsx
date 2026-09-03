"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

function TimeColumn({
  values,
  selected,
  onSelect,
}: {
  values: number[];
  selected: number | undefined;
  onSelect: (v: number) => void;
}) {
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.currentTarget.scrollTop += e.deltaY;
  };

  return (
    <div
      className="h-[300px] w-16 overflow-y-auto"
      onWheel={handleWheel}
    >
      <div className="flex flex-col p-2">
        {values.map((v) => (
          <Button
            key={v}
            size="icon"
            variant={selected === v ? "default" : "ghost"}
            className="w-full shrink-0 aspect-square"
            onClick={() => onSelect(v)}
          >
            {v.toString().padStart(2, "0")}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "MM/DD/YYYY hh:mm:ss",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const date = value ?? internalDate;

  const commit = (next: Date) => {
    setInternalDate(next);
    onChange?.(next);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const base = date ?? new Date();
    const next = new Date(selectedDate);
    next.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    commit(next);
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "second",
    value: number
  ) => {
    const base = date ?? new Date();
    const next = new Date(base);
    if (type === "hour") next.setHours(value);
    if (type === "minute") next.setMinutes(value);
    if (type === "second") next.setSeconds(value);
    commit(next);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy HH:mm:ss") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            defaultMonth={date}
            initialFocus
          />
          <div className="flex divide-x">
            <TimeColumn
              values={HOURS}
              selected={date?.getHours()}
              onSelect={(v) => handleTimeChange("hour", v)}
            />
            <TimeColumn
              values={MINUTES}
              selected={date?.getMinutes()}
              onSelect={(v) => handleTimeChange("minute", v)}
            />
            <TimeColumn
              values={SECONDS}
              selected={date?.getSeconds()}
              onSelect={(v) => handleTimeChange("second", v)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}