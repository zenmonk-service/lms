"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Title from "@/shared/typography/title";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import LeaveRequestFilters from "./components/filter-panel";
import LeaveRequests from "./components/leave-requests";
import UserLeaveRequestDetails from "./components/leave-requests/components/user-leave-request-details";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useContainerBreakpoint } from "@/shared/hooks/user-container-breakpoints";

interface IProps {
  showTitle?: boolean;
  className?: string;
  isAdmin?: boolean;
}

const CONTAINER_4XL_PX = 896;

const ApproveLeaveRequest = ({ showTitle = true, className, isAdmin = false }: IProps) => {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const { leaveRequestFilter } = useAppSelector((state) => state.leaveSlice);

  const panelRef = useRef<HTMLDivElement>(null);
  const isDesktopFilters = useContainerBreakpoint(panelRef, CONTAINER_4XL_PX);

  const currentActiveFilters = useMemo(() => {
    const count = [
      leaveRequestFilter?.leave_type_uuid,
      leaveRequestFilter?.status,
      leaveRequestFilter?.date_range,
      leaveRequestFilter?.user_uuid,
      leaveRequestFilter?.date,
    ].filter(Boolean).length;

    return count;
  }, [
    leaveRequestFilter?.leave_type_uuid,
    leaveRequestFilter?.status,
    leaveRequestFilter?.date_range,
    leaveRequestFilter?.user_uuid,
    leaveRequestFilter?.date,
  ]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "@container/panel p-4 py-6 md:p-6 h-screen max-h-[calc(100vh-53px)] flex flex-col",
        className,
      )}
    >
      {showTitle && (
        <Title
          title={{ text: "Leave Request Management" }}
          description={{ text: "Review and process employee leave requests with comprehensive approval workflows" }}
        />
      )}

      {!isDesktopFilters && (
        <Drawer direction="right" modal={false}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="flex ml-auto">
              {currentActiveFilters > 0 ? (
                <Badge className="h-5 min-w-5 px-1 tabular-nums">{currentActiveFilters}</Badge>
              ) : (
                <SlidersHorizontal className="size-4" />
              )}
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-80 sm:w-96 h-full">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>
                Filter leave requests by employee, status, leave type, and date range.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 min-h-0">
              <LeaveRequestFilters />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      <div className="flex flex-1 mt-4 bg-card rounded-lg border border-border overflow-hidden">
        {isDesktopFilters && (
          <>
            <div className="w-72 @6xl/panel:w-80 shrink-0">
              <LeaveRequestFilters />
            </div>
            <Separator orientation="vertical" />
          </>
        )}
        <div className={`w-full @2xl/panel:w-72 @4xl/panel:w-80 ${uuid ? "hidden @2xl/panel:block" : "block"}`}>
          <LeaveRequests isAdmin={isAdmin} />
        </div>
        <Separator orientation="vertical" className="hidden @2xl/panel:block" />
        <div className={`flex-1 min-w-0 ${uuid ? "block" : "hidden @2xl/panel:block"}`}>
          <UserLeaveRequestDetails isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
};

export default ApproveLeaveRequest;