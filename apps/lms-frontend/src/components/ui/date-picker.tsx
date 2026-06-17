"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface MonthPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const selectedDate = value ? dayjs(`${value}-01`) : dayjs();

  const [year, setYear] = useState(selectedDate.year());

  const selectedMonth = selectedDate.month();

  const handleSelectMonth = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, "0");

    onChange?.(`${year}-${month}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start min-w-[180px]">
          <CalendarIcon className="mr-2 h-4 w-4" />

          {selectedDate.format("MMM YYYY")}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="flex items-center justify-between mb-4">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setYear((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-medium">{year}</span>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setYear((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((month, index) => {
            const isSelected =
              selectedMonth === index && selectedDate.year() === year;

            return (
              <button
                key={month}
                onClick={() => handleSelectMonth(index)}
                className={`
                  h-10 rounded-md text-sm transition-colors
                  ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }
                `}
              >
                {month}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
