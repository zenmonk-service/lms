import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AttendanceTableSkeleton() {
  return (
    <div className="relative max-h-100 overflow-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 z-10 h-10 bg-background">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Check-in</TableHead>
            <TableHead className="text-center">Check-out</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-14" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-14" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-9 w-9 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}