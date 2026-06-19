import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceTable from "@/components/attendance/shared/components/table";
import { useState } from "react";
import { AttendanceSplitCard } from "./attendance-split-card";

interface IProps {
  userUUID: string;
}

export function AttendanceAnalytics({ userUUID }: IProps) {
  const [tab, setTab] = useState<"attendance" | "attendance-pie-chart">("attendance-pie-chart");

  return (
    <Card className="border border-border shadow-none">
      <div className="py-4 px-6 flex items-center justify-between border-b border-border rounded-t-xl bg-primary/10">
        <div>
          <p className="leading-none font-semibold">
            Attendance & Analytics
          </p>
          <p className="text-muted-foreground text-xs tracking-tight">
            Examine details of previous records, and check-ins.
          </p>
        </div>
        <Tabs
          defaultValue="attendance"
          value={tab}
          onValueChange={(value) =>
            setTab(value as "attendance" | "attendance-pie-chart")
          }
        >
          <TabsList>
            <TabsTrigger value="attendance-pie-chart">Analytics</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Logs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CardContent>
        {tab === "attendance-pie-chart" ?  <AttendanceSplitCard userUUID={userUUID} /> : <AttendanceTable showFilters={false} maxHeight="calc(100vh - 630px)" />}
      </CardContent>
    </Card>
  );
}
