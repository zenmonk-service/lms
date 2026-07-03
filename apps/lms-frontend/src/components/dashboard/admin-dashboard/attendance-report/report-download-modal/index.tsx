import dayjs from "dayjs";
import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { CalendarDays, Calendar, BarChart3, CalendarRange } from "lucide-react";
import { DateRangePicker } from "@/shared/date-range-picker";

type ReportRange = "7days" | "month" | "quarter" | "custom";

export function ReportDownloadModal({
  openReportModal,
  setOpenReportModal,
  dateRangeFilter,
  setDateRangeFilter,
  exportAttendanceExcel,
}: {
  openReportModal: boolean;
  setOpenReportModal: (open: boolean) => void;
  dateRangeFilter: { start_date?: string; end_date?: string };
  setDateRangeFilter: React.Dispatch<
    React.SetStateAction<{ start_date?: string; end_date?: string }>
  >;
  exportAttendanceExcel: () => void;
}) {
  const [selectedRange, setSelectedRange] = useState<ReportRange>("7days");

  const handleRangeChange = (value: ReportRange) => {
    setSelectedRange(value);

    const today = dayjs();

    switch (value) {
      case "7days":
        setDateRangeFilter({
          start_date: today.subtract(6, "day").format("YYYY-MM-DD"),
          end_date: today.format("YYYY-MM-DD"),
        });
        break;

      case "month":
        setDateRangeFilter({
          start_date: today.subtract(29, "day").format("YYYY-MM-DD"),
          end_date: today.format("YYYY-MM-DD"),
        });
        break;

      case "quarter":
        setDateRangeFilter({
          start_date: today.subtract(89, "day").format("YYYY-MM-DD"),
          end_date: today.format("YYYY-MM-DD"),
        });
        break;

      case "custom":
        setDateRangeFilter({});
        break;
    }
  };

  return (
    <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Attendance Report</DialogTitle>

          <DialogDescription>
            Choose a predefined range or select a custom date range.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedRange}
          onValueChange={(value) => handleRangeChange(value as ReportRange)}
          className="space-y-3"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Time Period</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "7days",
                    label: "Past 7 Days",
                    icon: CalendarDays,
                  },
                  {
                    value: "month",
                    label: "Past Month",
                    icon: Calendar,
                  },
                  {
                    value: "quarter",
                    label: "Past Quarter",
                    icon: BarChart3,
                  },
                  {
                    value: "custom",
                    label: "Custom Range",
                    icon: CalendarRange,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        handleRangeChange(item.value as ReportRange)
                      }
                      className={`rounded-xl border p-4 transition-all text-left
              ${
                selectedRange === item.value
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "hover:border-primary/40 hover:bg-muted/50"
              }`}
                    >
                      <Icon className="h-5 w-5 mb-3 text-primary" />

                      <p className="font-medium">{item.label}</p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {item.value === "7days" && "Last week"}
                        {item.value === "month" && "Last 30 days"}
                        {item.value === "quarter" && "Last 90 days"}
                        {item.value === "custom" && "Choose dates"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedRange === "custom" && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <DateRangePicker
                  setDateRange={setDateRangeFilter}
                  isDependant={false}
                  containerClassName="grid-cols-1"
                />
              </div>
            )}
          </div>
        </RadioGroup>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={() => setOpenReportModal(false)}>
            Cancel
          </Button>

          <Button
            disabled={!dateRangeFilter.start_date || !dateRangeFilter.end_date}
            onClick={() => {
              exportAttendanceExcel();
              setOpenReportModal(false);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
