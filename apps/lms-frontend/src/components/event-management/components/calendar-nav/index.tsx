"use client";

import { cn } from "@/lib/utils";
import { calendarRef, months } from "@/utils/data";
import { Button } from "@/components/ui/button";
import {
  generateDaysInMonth,
  goNext,
  goPrev,
  goToday,
  handleDayChange,
  handleMonthChange,
  handleYearChange,
  setView,
} from "@/utils/calendar-utils";
import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  GalleryVertical,
  Table,
  Tally3,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventAddForm } from "../event-add-form";
import { useAppDispatch, useAppSelector } from "@/store";
import { getPublicHolidaysAction } from "@/features/holidays/holidays.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermissions } from "@/lib/haspermissios";
import { getOrganizationEventAction } from "@/features/organizations/organizations.action";

interface CalendarNavProps {
  calendarRef: calendarRef;
  start: Date;
  end: Date;
  viewedDate: Date;
}

export default function CalendarNav({
  calendarRef,
  start,
  end,
  viewedDate,
}: CalendarNavProps) {
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const dispatch = useAppDispatch();

  const selectedMonth = viewedDate.getMonth() + 1;
  const selectedDay = viewedDate.getDate();
  const selectedYear = viewedDate.getFullYear();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => ({
    value: String(currentYear - 5 + i),
    label: String(currentYear - 5 + i),
  }));

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = generateDaysInMonth(daysInMonth);

  const [daySelectOpen, setDaySelectOpen] = useState(false);

  const handleYearChangeApi = async (year: number) => {
    await dispatch(getPublicHolidaysAction(year));
    await dispatch(
      getOrganizationEventAction({ org_uuid: currentOrganization.uuid, year }),
    );
  };

  return (
    <div className="flex flex-wrap min-w-full justify-center gap-3 px-10 ">
      <div className="flex flex-row space-x-1">
        {/* Navigate to previous date interval */}

        <Button
          variant="ghost"
          className="w-8"
          onClick={() => {
            const lastYear = calendarRef
              .current!.getApi()
              .getDate()
              .getFullYear();
            goPrev(calendarRef, handleYearChangeApi, lastYear);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Day Lookup */}

        {currentView == "timeGridDay" && (
          <Popover open={daySelectOpen} onOpenChange={setDaySelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-20 justify-between text-xs font-semibold"
              >
                {selectedDay
                  ? dayOptions.find((day) => day.value === String(selectedDay))
                      ?.label
                  : "Select day..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search day..." />
                <CommandList>
                  <CommandEmpty>No day found.</CommandEmpty>
                  <CommandGroup>
                    {dayOptions.map((day) => (
                      <CommandItem
                        key={day.value}
                        value={day.value}
                        onSelect={(currentValue) => {
                          handleDayChange(
                            calendarRef,
                            viewedDate,
                            currentValue,
                          );
                          //   setValue(currentValue === selectedMonth ? "" : currentValue);
                          setDaySelectOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(selectedDay) === day.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {day.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Month Lookup */}
        <Select
          value={String(selectedMonth)}
          onValueChange={(value) => {
            handleMonthChange(calendarRef, viewedDate, value);
          }}
        >
          <SelectTrigger className="text-xs md:text-sm font-semibold">
            <SelectValue placeholder="Select month..." />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Lookup */}
        <Select
          value={String(selectedYear)}
          onValueChange={(value) => {
            const mockEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>;
            handleYearChange(calendarRef, viewedDate, mockEvent);
            dispatch(getPublicHolidaysAction(Number(value)));
            dispatch(
              getOrganizationEventAction({
                org_uuid: currentOrganization.uuid,
                year :Number(value),
              }),
            );
          }}
        >
          <SelectTrigger className="text-xs md:text-sm font-semibold">
            <SelectValue placeholder={selectedYear} />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Navigate to next date interval */}

        <Button
          variant="ghost"
          className="w-8"
          onClick={() => {
            const lastYear = calendarRef
              .current!.getApi()
              .getDate()
              .getFullYear();
            goNext(calendarRef, handleYearChangeApi, lastYear);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {/* Button to go to current date */}

        <Button
          className="w-[90px] text-xs md:text-sm"
          variant="outline"
          onClick={() => {
            const lastYear = calendarRef
              .current!.getApi()
              .getDate()
              .getFullYear();
            goToday(calendarRef, handleYearChangeApi, lastYear);
          }}
        >
          {currentView === "timeGridDay"
            ? "Today"
            : currentView === "timeGridWeek"
              ? "This Week"
              : currentView === "dayGridMonth"
                ? "This Month"
                : null}
        </Button>

        {/* Change view with tabs */}

        <Tabs defaultValue="dayGridMonth">
          <TabsList className="flex w-44 md:w-64">
            {/* <TabsTrigger
              value="timeGridDay"
              onClick={() =>
                setView(calendarRef, "timeGridDay", setCurrentView)
              }
              className={`space-x-1 ${
                currentView === "timeGridDay" ? "w-1/2" : "w-1/4"
              }`}
            >
              <GalleryVertical className="h-5 w-5" />
              {currentView === "timeGridDay" && (
                <p className="text-xs md:text-sm">Day</p>
              )}
            </TabsTrigger> */}
            <TabsTrigger
              value="dayGridMonth"
              onClick={() =>
                setView(calendarRef, "dayGridMonth", setCurrentView)
              }
              className={`space-x-1 ${
                currentView === "dayGridMonth" ? "w-1/2" : "w-1/4"
              }`}
            >
              <Table className="h-5 w-5 rotate-90" />
              {currentView === "dayGridMonth" && (
                <p className="text-xs md:text-sm">Month</p>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="timeGridWeek"
              onClick={() => {
                setView(calendarRef, "timeGridWeek", setCurrentView);
                console.log(
                  calendarRef.current!.getApi().getDate().getDate(),
                  new Date().getDate(),
                );

                if (
                  calendarRef.current!.getApi().getDate().getMonth() ===
                    new Date().getMonth() &&
                  calendarRef.current!.getApi().getDate().getFullYear() ===
                    new Date().getFullYear()
                ) {
                  const lastYear = calendarRef
                    .current!.getApi()
                    .getDate()
                    .getFullYear();
                  goToday(calendarRef, handleYearChangeApi, lastYear);
                }
              }}
              className={`space-x-1 ${
                currentView === "timeGridWeek" ? "w-1/2" : "w-1/4"
              }`}
            >
              <Tally3 className="h-5 w-5" />
              {currentView === "timeGridWeek" && (
                <p className="text-xs md:text-sm">Week</p>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Add event button  */}
        {hasPermissions(
          "organization_event_management",
          "create",
          currentUserRolePermissions,
          currentUser.email,
        ) && <EventAddForm start={start} end={end} />}
      </div>
    </div>
  );
}
