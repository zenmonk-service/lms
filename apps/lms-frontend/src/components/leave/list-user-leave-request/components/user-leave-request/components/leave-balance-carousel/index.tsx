import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LeaveBalance } from "@/features/leave/leave.types";
import { Coins, Plus, Sparkles } from "lucide-react";
import { ProvideSlaModal } from "./components/sla-modal";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { getBadge } from "@/utils/get-badge";

interface IProps {
  leaveBalance: LeaveBalance[];
}

const LeaveBalanceCarousel = ({ leaveBalance }: IProps) => {
  const [open, setOpen] = useState(false);
  const [selectedLeaveBalance, setSelectedLeaveBalance] =
  useState<LeaveBalance | null>(null);
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);
  
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
              
              return (
                <CarouselItem
                  key={item.leave_type.code}
                  className="basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-0.5">
                    <Card className="border border-border shadow-none rounded-lg bg-card py-0 gap-0">
                      <CardContent className="px-2 py-2 space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          {getBadge(
                            "default",
                            `${item.leave_type.code}`,
                            undefined,
                            "outline",
                            "",
                          )}

                          <div className="space-x-2">
                            {item.sla && Number.parseInt(item.sla) > 0 &&
                              getBadge(
                                "default",
                                `SLA Given: +${item.sla}`,
                                <Sparkles className="w-3 h-3" />,
                                "recommended",
                                "",
                              )}
                            {getBadge(
                              "default",
                              `Allocated ${allocated}`,
                              <Coins className="w-3 h-3" />,
                              "secondary",
                              "",
                            )}
                          </div>
                        </div>

                        <p className="font-semibold">{item.leave_type.name}</p>

                        <div className="flex items-end justify-between">
                          <p className="text-lg font-bold text-primary leading-none">
                            {numericBalance.toFixed(2) +
                              (item.final_balance
                                ? ` + ${item.final_balance}`
                                : "")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Available
                          </p>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Ratio</span>
                          <span>{usagePercent.toFixed(0)}%</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setSelectedLeaveBalance(item);
                            setOpen(true);
                          }}
                        >
                          <Plus size={12} />
                          Provide SLA
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })(),
          )}onOpenChange
        </CarouselContent>
        <CarouselNext className="h-7 w-7 rounded-md shadow-none shrink-0" />
      </Carousel>
      {selectedLeaveBalance && (
        <ProvideSlaModal
          open={open}
          onOpenChange={setOpen}
          setSelectedLeaveBalance={setSelectedLeaveBalance}
          leaveBalance={selectedLeaveBalance}
          userUUId={currentUser?.user_id}
        />
      )}
    </div>
  );
};

export default LeaveBalanceCarousel;
