import { Card, CardContent, CardFooter } from "@/components/ui/card";

import React from "react";
import LeaveRequestTable from "./leave-request-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";

const LeaveRequest = () => {
  const router = useRouter();
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const can = usePermissionCheck();
  const isView  = can(PermissionTag.LEAVE_REQUEST_MANAGEMENT, PermissionAction.READ)
  const handleClick = () =>
    router.push(`/${currentOrganization?.uuid}/my-leaves`);
  
  return (
    <Card className="border border-border shadow-none pb-2!">
      <div className="py-4 px-6 flex items-center justify-between border-b border-border rounded-t-xl bg-primary/10">
        <div>
          <p className="leading-none font-semibold">Leave Requests</p>
          <p className="text-muted-foreground text-xs tracking-tight">
            Examine details of previous leave requests.
          </p>
        </div>
      </div>

      <CardContent>
        <LeaveRequestTable />
      </CardContent>
      <CardFooter className="mt-auto border-t border-border w-full pt-2!">
      {isView && (
          <Button
          variant="link"
          size="sm"
          className="mx-auto"
          onClick={handleClick}
        >
          Open Leave Request Management
        </Button>
      )}
      </CardFooter>
    </Card>
  );
};

export default LeaveRequest;
