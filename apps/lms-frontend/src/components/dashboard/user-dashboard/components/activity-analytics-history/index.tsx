import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceTable from "@/components/attendance/shared/components/table";
import { useState } from "react";
import { AttendanceSplitCard } from "./attendance-split-card";
import { useScreenSize } from "@/shared/hooks/use-screen-size";

interface IProps {
  userUUID: string;
}

export function AttendanceAnalytics({ userUUID }: IProps) {
  const { isMobile } = useScreenSize();
  const [tab, setTab] = useState<"attendance" | "attendance-pie-chart">("attendance-pie-chart");

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Attendance &amp; Analytics</CardTitle>
          <CardDescription className="text-xs tracking-tight">
            Examine details of previous records, and check-ins.
          </CardDescription>
        </div>
        <Tabs
          defaultValue="attendance"
          value={tab}
          onValueChange={(value) =>
            setTab(value as "attendance" | "attendance-pie-chart")
          }
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          <TabsList>
            <TabsTrigger value="attendance-pie-chart">Analytics</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Logs</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {tab === "attendance-pie-chart" ?  <AttendanceSplitCard userUUID={userUUID} /> : <AttendanceTable showFilters={false} maxHeight="calc(100vh - 630px)" />}
      </CardContent>
    </Card>
  );
}
