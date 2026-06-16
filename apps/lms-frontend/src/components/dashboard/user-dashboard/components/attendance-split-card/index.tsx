"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartNoAxesCombined, Plane, UserCheck, UserMinus, type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AttendanceChartDatum } from "../../dashboard.types";
import { CustomPieTooltip } from "./components/pie-tooltip";


interface IProps {
  monthLabel: string;
  chartData: AttendanceChartDatum[];
  totalDays: number;
}

const STAT_ICONS: Record<string, LucideIcon> = {
  Present: UserCheck,
  Absent: UserMinus,
  "On Leave": Plane,
};

export function AttendanceSplitCard({ monthLabel, chartData, totalDays }: IProps) {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-4!">
        <CardTitle className="flex items-center gap-2">
          <ChartNoAxesCombined className="h-4 w-4" />
          Attendance split
        </CardTitle>
        <CardDescription>
          Real-time tracking for{" "}
          <span className="font-medium text-foreground">{monthLabel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative h-70 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  wrapperStyle={{ zIndex: 30 }}
                  content={<CustomPieTooltip total={totalDays} />}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                      stroke="none"
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-foreground">{totalDays}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Total Days
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {chartData.map((item) => {
              const percent =
                totalDays > 0 ? Math.round((item.value / totalDays) * 100) : 0;
              const Icon = STAT_ICONS[item.name];

              return (
                <div
                  key={item.name}
                  className="group rounded-xl border border-border bg-muted/20 p-3 transition-all hover:bg-card hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background"
                        style={{ color: item.color }}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">
                          {item.name}
                        </p>
                        <p className="text-md font-bold text-foreground">{item.value}</p>
                      </div>
                    </div>

                    <div className="text-right flex-1">
                      <p className="text-xs font-bold text-muted-foreground">{percent}%</p>
                      <Progress value={percent} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}