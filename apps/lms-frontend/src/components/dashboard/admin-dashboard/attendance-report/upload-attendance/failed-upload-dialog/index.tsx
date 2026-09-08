import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function FailedAttendanceDialog({
  showImportResult,
  setShowImportResult,
  importSummary,
  failedAttendances,
}: {
  showImportResult: boolean;
  setShowImportResult: (show: boolean) => void;
  importSummary: { total: number; failed: number };
  failedAttendances: { row: number; emp_code: string; message: string }[];
}) {
  return (
    <Dialog open={showImportResult} onOpenChange={setShowImportResult}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Attendance Import Summary</DialogTitle>
        </DialogHeader>

        {importSummary && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5" />

                  <span className="text-sm font-medium">
                    Successfully Uploaded
                  </span>
                </div>

                <p className="mt-2 text-2xl font-semibold">
                  {importSummary.total - importSummary.failed}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5" />

                  <span className="text-sm font-medium">Failed</span>
                </div>

                <p className="mt-2 text-2xl font-semibold">
                  {importSummary.failed}
                </p>
              </div>
            </div>

            {/* Failed records */}
            {failedAttendances.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Failed Attendance Records
                </h3>

                <div className="max-h-[400px] overflow-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 border-b bg-background">
                      <tr>

                        <th className="px-4 py-3 text-left">Employee Code</th>

                        <th className="px-4 py-3 text-left">Reason</th>
                      </tr>
                    </thead>

                    <tbody>
                      {failedAttendances.map((attendance) => (
                        <tr
                          key={`${attendance.row}-${attendance.emp_code}`}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {attendance.emp_code || "-"}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {attendance.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
