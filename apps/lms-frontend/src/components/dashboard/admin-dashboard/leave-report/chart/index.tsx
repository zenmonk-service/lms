import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartNoAxesCombined } from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CustomLeaveRequestPieTooltip } from "../../../shared/custom-tooltips";
import { MonthPicker } from "@/components/ui/month-picker";

export default function LeaveCharts({
  loading,
  data,
  setMonth,
  month,
}: {
  loading: boolean;
  data: { color: string; value: number; status: string }[];
  setMonth: (month: string) => void;
  month: string;
}) {
  return (
    <div>
      {loading ? (
        <div className="grid gap-4 mb-6">
          <Card className="shadow-none">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4  mb-6">
          <Card className="shadow-none">
            <CardHeader className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
                  <ChartNoAxesCombined className="h-4 w-4" />
                  Leave Request split
                </CardTitle>
                <CardDescription>Leave request statistics</CardDescription>
              </div>
              <MonthPicker onChange={setMonth} value={month} />
            </CardHeader>
            <CardContent>
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative h-70 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        wrapperStyle={{ zIndex: 30 }}
                        content={
                          <CustomLeaveRequestPieTooltip
                            total={Number(
                              data.reduce((sum, entry) => sum + entry.value, 0),
                            )}
                          />
                        }
                      />
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {data.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={entry.color}
                            stroke="none"
                            className="cursor-pointer transition-opacity hover:opacity-80"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground">
                      {data.reduce((sum, entry) => sum + entry.value, 0)}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">
                      Total Requests
                    </span>
                  </div>
                </div>
                <ul className="min-w-[150px] space-y-2.5">
                  {data.map((item) => (
                    <li
                      key={item.status}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {item.status}
                      </span>
                      <span className="ml-auto tabular-nums font-medium text-foreground">
                        {item.value > 0 ? item.value : 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
