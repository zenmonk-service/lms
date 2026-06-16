"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeaveChartDatum } from "../../dashboard.types";
import { CustomBarTooltip } from "./components/bar-tooltip";


interface IProps {
  monthLabel: string;
  chartData: LeaveChartDatum[];
}

export function LeaveStatusCard({ monthLabel, chartData }: IProps) {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-4!">
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          Leave request status
        </CardTitle>
        <CardDescription>
          Current user leave requests in{" "}
          <span className="text-foreground">{monthLabel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
              <XAxis
                dataKey="status"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={45}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.total > 0 ? entry.fill : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}