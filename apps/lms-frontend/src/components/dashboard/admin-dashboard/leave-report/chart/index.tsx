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
  data: { color: string; value: number; status: string }[];
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
                        key={item.status}
                        className="group rounded-xl border border-border bg-muted/20 p-3 transition-all hover:bg-card hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background"
                              style={{ color: item.color }}
                            >
                              {item.status === "Approved" && (
                                <CheckCircle2 className="h-5 w-5" />
                              )}

                              {item.status === "Rejected" && (
                                <XCircle className="h-5 w-5" />
                              )}

                              {item.status === "Pending" && (
                                <Clock3 className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">
                                {item.status}
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
