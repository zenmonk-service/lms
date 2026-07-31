"use client";

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

interface IProps {
  showTitle?: boolean;
  className?: string;
}

const ApproveLeaveRequest = ({ showTitle = true, className }: IProps) => {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  return (
    <div className={cn("@container/panel p-4 md:p-6 h-screen max-h-[calc(100vh-53px)] flex flex-col", className)}>
      {showTitle && (
        <Title
          title={{ text: "Leave Request Management" }}
          description={{ text: "Review and process employee leave requests with comprehensive approval workflows" }}
        />
      )}

      <Drawer direction="right" modal={false}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="flex @4xl/panel:hidden ml-auto">
            <SlidersHorizontal className="size-4" />
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

      <div className="flex flex-1 mt-4 bg-card rounded-lg border border-border overflow-hidden">
        <div className="hidden @4xl/panel:block w-72 @6xl/panel:w-80 shrink-0">
          <LeaveRequestFilters />
        </div>
        <Separator orientation="vertical" className="hidden @4xl/panel:block"/>
        <div className={`w-full @2xl/panel:w-72 @4xl/panel:w-80 ${uuid ? "hidden @2xl/panel:block" : "block"}`}>
          <LeaveRequests />
        </div>
        <Separator orientation="vertical" className="hidden @2xl/panel:block"/>
        <div className={`flex-1 min-w-0 ${uuid ? "block" : "hidden @2xl/panel:block"}`}>
          <UserLeaveRequestDetails />
        </div>
      </div>
    </div>
  );
};

export default ApproveLeaveRequest;