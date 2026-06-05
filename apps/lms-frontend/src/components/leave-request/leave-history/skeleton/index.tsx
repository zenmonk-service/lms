import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaveHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <div className="relative flex items-center gap-2">
          <Carousel opts={{ align: "start" }} className="w-full flex-1">
            <CarouselPrevious className="h-7 w-7 rounded-md shadow-none shrink-0" />
            <CarouselContent>
              {[1, 2, 3].map((item) => (
                <CarouselItem key={item} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="p-0.5">
                    <Card className="border border-border shadow-none rounded-lg bg-card py-0 gap-0">
                      <CardContent className="px-2 py-2 space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <Skeleton className="h-4 w-12 rounded-sm" />
                          <Skeleton className="h-4 w-20 rounded-sm" />
                        </div>

                        <Skeleton className="h-3 w-32" />

                        <div className="flex items-end justify-between">
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-2 w-12" />
                        </div>

                        <Skeleton className="h-1.5 w-full rounded-full" />

                        <div className="flex items-center justify-between">
                          <Skeleton className="h-2 w-8" />
                          <Skeleton className="h-2 w-8" />
                        </div>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          <Skeleton className="h-4 w-20 rounded-sm" />
                          <Skeleton className="h-4 w-16 rounded-sm" />
                        </div>

                        <Skeleton className="h-2 w-20" />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext className="h-7 w-7 rounded-md shadow-none shrink-0" />
          </Carousel>
        </div>
      </div>
    </div>
  );
}