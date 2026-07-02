import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateRangePicker } from "@/shared/date-range-picker";
import { Download } from "lucide-react";

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
  return (
    <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Attendance Report</DialogTitle>

          <DialogDescription>
            Select a start and end date to generate the attendance report.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DateRangePicker
            setDateRange={setDateRangeFilter}
            isDependant={false}
            containerClassName="grid-cols-1"
          />
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setOpenReportModal(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            className="w-full sm:w-auto min-w-[170px]"
            disabled={
              !dateRangeFilter?.start_date || !dateRangeFilter?.end_date
            }
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
