"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthOption } from "../../dashboard.types";
import { getBadge } from "@/utils/get-badge";
import { Dot } from "lucide-react";

interface IProps {
  analyticsUserName: string;
  analyticsUserEmail: string;
  monthLabel: string;
  selectedMonth: number;
  selectedYear: number;
  months: MonthOption[];
  years: number[];
  role?: string;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function DashboardHeader({
  analyticsUserName,
  analyticsUserEmail,
  monthLabel,
  selectedMonth,
  selectedYear,
  months,
  years,
  role,
  onMonthChange,
  onYearChange,
}: IProps) {

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold capitalize wrap-break-word">
          {getGreeting()}, {analyticsUserName}!
        </h2>
        <div className="flex items-center gap-2">
          {role && getBadge("default", role, undefined, "secondary")}
          <Dot className="h-4 w-4" />
          <p className="text-sm text-muted-foreground">
            {analyticsUserEmail ? `${analyticsUserEmail}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(selectedMonth)}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(selectedYear)}
          onValueChange={(value) => onYearChange(Number(value))}
        >
          <SelectTrigger className="w-30">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
