"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LeaveBalance } from "@/features/leave/leave.types";
import { Coins, Sparkles } from "lucide-react";
import { getBadge } from "@/utils/badge/get-badge";
import LeaveBalanceDialog from "./dialog";

interface IProps {
  leaveBalance: LeaveBalance[];
}

const LeaveBalanceCarousel = ({ leaveBalance }: IProps) => {
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(
    null,
  );

  return (
    <div className="relative flex items-center gap-2">
      <Carousel opts={{ align: "start" }} className="w-full flex-1">
        <CarouselPrevious className="hidden rounded-md sm:inline-flex" />
        <CarouselContent>
          {leaveBalance.map((item) => {
            const numericBalance = Number(item.balance || 0);
            const allocated = Number(item.leaves_allocated || 0);
            const usagePercent =
              allocated > 0
                ? Math.max(0, Math.min(100, (numericBalance / allocated) * 100))
                : 0;

            return (
              <CarouselItem
                key={item.uuid}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div className="h-full p-0.5">
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedBalance(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedBalance(item);
                      }
                    }}
                    className="group h-full cursor-pointer rounded-xl border border-border bg-card py-0 gap-0 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <CardContent className="space-y-2 px-2 py-2">
                      <div className="flex max-w-full flex-wrap items-center justify-between gap-1 w-full">
                        {getBadge(
                          "default",
                          `${item.leave_type.code}`,
                          undefined,
                          "outline",
                          "w-fit max-w-full truncate",
                        )}

                        <div className="space-x-2">
                          {item.sla &&
                            Number(item.sla) > 0 &&
                            getBadge(
                              "default",
                              `SLA Given: +${item.sla}`,
                              <Sparkles className="h-3 w-3" />,
                              "recommended",
                              "",
                            )}
                          {getBadge(
                            "default",
                            `Allocated ${allocated}`,
                            <Coins className="h-3 w-3" />,
                            "secondary",
                            "",
                          )}
                        </div>
                      </div>

                      <p className="truncate text-sm font-semibold sm:text-base">
                        {item.leave_type.name}
                      </p>

                      <div className="flex items-end justify-between">
                        <p className="text-base font-bold leading-none text-primary sm:text-lg">
                          {numericBalance.toFixed(2) +
                            (item.final_balance
                              ? ` + ${item.final_balance}`
                              : "")}
                        </p>
                        <p className="text-[11px] text-muted-foreground sm:text-xs">
                          Available
                        </p>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Ratio</span>
                        <span>{usagePercent.toFixed(0)}%</span>
                      </div>

                      <p className="pt-1 text-[10px] text-muted-foreground opacity-80 group-hover:opacity-100 sm:text-[11px]">
                        Tap to view balance history
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselNext className="hidden rounded-md sm:inline-flex" />
      </Carousel>

      <LeaveBalanceDialog
        open={Boolean(selectedBalance)}
        selectedBalance={selectedBalance}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBalance(null);
          }
        }}
      />
    </div>
  );
};

export default LeaveBalanceCarousel;
