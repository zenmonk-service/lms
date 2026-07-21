import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { listOrganizationEventsAction } from "@/features/organizations/list-organization-events/list-organization-events.action";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useState } from "react";
import { ListEventsSkeleton } from "./components/skeleton";
import ListIndividualEvent from "./components/list";
import NoDataFound from "@/shared/no-data-found";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getDateRange } from "@/utils/range-calculator";
import { useScreenSize } from "@/shared/hooks/use-screen-size";

const ListEvents = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isMobile } = useScreenSize();
  const { organizationEvents, isLoading, currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const [tab, setTab] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    let week = undefined;
    if(tab === "week") week = getDateRange("week");

    const params = {
      month: tab === "month" ? new Date().getMonth() : undefined,
      year: tab === "year" ? new Date().getFullYear() : undefined,
      ...week,
      limit: 10
    }

    dispatch(
      listOrganizationEventsAction({
        org_uuid: currentOrganization?.uuid,
        params
      }),
    );
  }, [currentOrganization?.uuid, dispatch, tab]);

  const handleClick = () => router.push(`/${currentOrganization?.uuid}/organization-event-management`);

  return (
    <Card className="border border-border shadow-none pb-2!">
      <div className="py-4 px-6 flex items-center justify-between border-b border-border rounded-t-xl bg-primary/10">
        <div>
          <p className="leading-none font-semibold">
            Events & Company Holidays
          </p>
          <p className="text-muted-foreground text-xs">
            Never miss out on important key alignments.
          </p>
        </div>
        <Tabs
          defaultValue="week"
          value={tab}
          onValueChange={(value) =>
            setTab(value as "week" | "month" | "year")
          }
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? <ListEventsSkeleton /> : 
        <CardContent>
          <div className="max-h-66 overflow-y-auto no-scrollbar">
            {organizationEvents.length == 0  ? <NoDataFound title={`No events this ${tab}`} message="There are no events scheduled for this period." /> : (
              <div className="space-y-2">
                {organizationEvents.map((event) => <ListIndividualEvent key={event.uuid} event={event} />)}
              </div>
            )}
          </div>
        </CardContent>
      }

      <CardFooter className="mt-auto border-t border-border w-full pt-2!">
          <Button variant="link" size="sm" className="mx-auto" onClick={handleClick}>
            Open Holiday & Event Calendar
          </Button>
      </CardFooter>
    </Card>
  );
};

export default ListEvents;
