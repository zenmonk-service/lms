"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Globe, Link, Users } from "lucide-react";
import { Organization } from "@/features/organizations/organizations.slice";
import CreateUser from "../user/create-user";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function OrganizationCard({
  org,
  onManageMembers,
  onEdit,
  onDelete,
}: {
  org: Organization;
  onManageMembers: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}) {
  return (
    <Card className="overflow-hidden bg-white border-0">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{org.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-0.5">
              <Globe className="h-3.5 w-3.5" />
              <span className="truncate max-w-[160px]">
                {org.domain || "—"}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            className="cursor-pointer w-full shadow-none border-1 border-slate-200"
            onClick={() => onManageMembers(org)}
          >
            <Users className="mr-2 h-4 w-4" /> Manage Organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
