"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { getOrganizationUserDataAction } from "@/features/organizations/organizations.action";

function Dashboard({
  organization_uuid,
  email,
}: {
  organization_uuid: string;
  email: string;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      getOrganizationUserDataAction({
        organizationId: organization_uuid,
        email,
      })
    );
  }, [organization_uuid, email]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-50px)]">
      <div className="bg-card">
        <img
          src="/working.svg"
          alt="work-in-progress"
          className="w-132 h-132"
        />
      </div>
    </div>
  );
}

export default Dashboard;
