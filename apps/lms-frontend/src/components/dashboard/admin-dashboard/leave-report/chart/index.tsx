import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CustomPieTooltip } from "../../../shared/custom-tooltips";
import { Progress } from "@/components/ui/progress";
import { MonthPicker } from "@/components/ui/month-picker";

export default function LeaveCharts({
  loading,
  data,
}: {
  loading: boolean;
  data: { color: string; value: number; name: string }[];
}) {
  return (
    <div>
      {loading ? (
        <div className="grid gap-4 mb-6">
          <Card className="border-border/70 shadow-sm">
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
          <Card className="border border-border">
            <CardHeader>
              <div className=" flex items-center justify-between">
                <div className=" flex flex-col items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <ChartNoAxesCombined className="h-4 w-4" />
                    Leave Request split
                  </CardTitle>
                  <CardDescription>leave request statistics</CardDescription>
                </div>
                <MonthPicker></MonthPicker>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative h-70 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        wrapperStyle={{ zIndex: 30 }}
                        content={
                          <CustomPieTooltip
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
                            key={entry.name}
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
                <div className="space-y-4">
                  {data.map((item) => {
                    const percent =
                      item.value > 0 &&
                      Number(
                        data.reduce((sum, entry) => sum + entry.value, 0),
                      ) > 0
                        ? Math.round(
                            (item.value /
                              Number(
                                data.reduce(
                                  (sum, entry) => sum + entry.value,
                                  0,
                                ),
                              )) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={item.name}
                        className="rounded-xl border border-border bg-background p-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-fit p-2 items-center justify-center rounded-lg border border-border bg-muted"
                              style={{ color: item.color }}
                            >
                              {item.name === "Approved" && <CheckCircle2 size={20} />}
                              {item.name === "Rejected" && <XCircle size={20} />}
                              {item.name === "Pending" && <Clock3 size={20} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">
                                {item.name}
                              </p>
                              <p className="text-md font-bold text-foreground">
                                {item.value > 0 ? item.value : 0}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-1">
                            <p className="text-xs font-bold text-muted-foreground">
                              {percent}%
                            </p>
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
        </div>
      )}
    </div>
  );
}
