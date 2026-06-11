"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Globe, Users } from "lucide-react";
import { Organization } from "@/features/organizations/organizations.types";

interface IProps {
  org: Organization;
  onManageMembers: (org: Organization) => void;
}

export default function OrganizationCard({ org, onManageMembers }: IProps) {
  return (
    <Card className="bg-card border border-border flex flex-col rounded-md">
      <CardHeader className="flex">
        <div className="flex items-center gap-3">
          <Avatar className="rounded-none">
            <AvatarImage
              src={org.logo_url || "https://github.com/shadcn.png"}
              alt={`Logo of ${org.name}`}
              className="object-cover"
            />
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="wrap-break-word">{org.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Globe className="h-3 w-3" />
              <span className="max-w-40 truncate wrap-break-word">
                {org.domain || "—"}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={() => onManageMembers(org)}>
          <Users className="mr-2 h-4 w-4" /> Manage Organization
        </Button>
      </CardContent>
    </Card>
  );
}
