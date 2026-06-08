import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LeaveBalance } from "@/features/leave/leave.types";
import { CalendarClock, CheckCircle2, Coins, XCircle } from "lucide-react";

interface IProps {
  leaveBalance: LeaveBalance[];
}

const LeaveBalanceCarousel = ({ leaveBalance }: IProps) => {
  return (
    <div className="relative flex items-center gap-2">
      <Carousel opts={{ align: "start" }} className="w-full flex-1">
        <CarouselPrevious className="h-7 w-7 rounded-md shadow-none shrink-0" />
        <CarouselContent>
          {leaveBalance.map((item) =>
            (() => {
              const numericBalance = Number(item.balance || 0);
              const allocated = Number(item.leaves_allocated || 0);
              const usagePercent =
                allocated > 0
                  ? Math.max(
                      0,
                      Math.min(100, (numericBalance / allocated) * 100),
                    )
                  : 0;

              const accrualPeriod = item.leave_type.accrual?.period
                ?.replaceAll("_", " ")
                .toUpperCase();

              return (
                <CarouselItem
                  key={item.leave_type.code}
                  className="basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-0.5">
                    <Card className="border border-border shadow-none rounded-lg bg-card py-0 gap-0">
                      <CardContent className="px-2 py-2 space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <Badge
                            variant="outline"
                            className="rounded-sm text-[9px] font-semibold px-1.5 py-0"
                          >
                            {item.leave_type.code}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="rounded-sm text-[9px] px-1.5 py-0"
                          >
                            <Coins className="w-3 h-3 mr-1" />
                            Allocated {allocated}
                          </Badge>
                        </div>

                        <p className="font-semibold text-xs line-clamp-1">
                          {item.leave_type.name}
                        </p>

                        <div className="flex items-end justify-between">
                          <p className="text-lg font-bold text-primary leading-none">
                            {numericBalance.toFixed(2)}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            available
                          </p>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                          <span>ratio</span>
                          <span>{usagePercent.toFixed(0)}%</span>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          <Badge
                            variant="outline"
                            className="rounded-sm text-[9px] px-1.5 py-0"
                          >
                            <CalendarClock className="w-3 h-3 mr-1" />
                            {accrualPeriod || "NO ACCRUAL"}
                          </Badge>

                          {item.leave_type.allow_negative_leaves ? (
                            <Badge
                              variant="default"
                              className="rounded-sm text-[9px] px-1.5 py-0"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Negative
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="rounded-sm text-[9px] px-1.5 py-0"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              No-negative
                            </Badge>
                          )}
                        </div>

                        <p className="text-[9px] text-muted-foreground">
                          {item.period}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })(),
          )}
        </CarouselContent>
        <CarouselNext className="h-7 w-7 rounded-md shadow-none shrink-0" />
      </Carousel>
    </div>
  );
};

export default LeaveBalanceCarousel;
