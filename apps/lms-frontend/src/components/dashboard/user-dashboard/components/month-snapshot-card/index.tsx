import { LeaveRow } from "../../dashboard.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBadge } from "@/utils/get-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface IProps {
  totalAttendanceDays: number;
  leaveRequests: LeaveRow[];
}

export function MonthSnapshotCard({
  totalAttendanceDays,
  leaveRequests,
}: IProps) {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-4!">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Month Snapshot
        </CardTitle>
        <CardDescription>
          You have {totalAttendanceDays} attendance days this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-auto border border-border rounded-sm no-scrollbar">
          <Table>
            <TableHeader className="bg-accent sticky top-0 z-10 h-10 pointer-events-none">
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leaveRequests.map((leave) => (
                <TableRow key={leave.uuid}>
                  <TableCell>{leave.start_date}</TableCell>
                  <TableCell>{leave.end_date}</TableCell>
                  <TableCell>{leave.leave_duration || "-"}</TableCell>
                  <TableCell>{getBadge(leave.status, leave.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
