"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Permission } from "@/features/permissions/permission.slice";
import {
  BadgeCheck,
  BadgePlus,
  BookOpen,
  Building2,
  CalendarClock,
  ChartColumnBig,
  CircleCheck,
  CirclePower,
  ClipboardCheck,
  CopyPlus,
  FilePenLine,
  LoaderCircle,
  LogIn,
  LogOut,
  Megaphone,
  Palmtree,
  Power,
  Shield,
  Trash,
  Umbrella,
  UserCheck,
  UserCog,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { AssignPermissionSkeleton } from "../skeleton";

export default function RolePermissionForm({
  permissions,
  selectedPermissions = [],
  onSave,
  handleCancel,
  isLoading = false,
  isUpdating = false,
}: {
  permissions: Permission[];
  selectedPermissions?: Permission[];
  onSave: (permissionIds: string[]) => void;
  handleCancel: () => void;
  isLoading?: boolean;
  isUpdating?: boolean;
}) {
  const grouped = permissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      acc[perm.tag] = acc[perm.tag] || [];
      acc[perm.tag].push(perm);
      return acc;
    },
    {},
  );

  const [selected, setSelected] = useState(
    new Set(selectedPermissions.map((perm) => perm.uuid)),
  );

  useEffect(() => {
    setSelected(new Set(selectedPermissions.map((perm) => perm.uuid)));
  }, [selectedPermissions]);

  const getIcon = (action: string) => {
    switch (action) {
      case "user_management":
        return <UserCog className="h-4 w-4" />;
      case "user_attendance_management":
        return <UserCheck className="h-4 w-4" />;
      case "attendance_management":
        return <ClipboardCheck className="h-4 w-4" />;
      case "organization_management":
        return <Building2 className="h-4 w-4" />;
      case "organization_holiday_management":
        return <Umbrella className="h-4 w-4" />;
      case "organization_event_management":
        return <Megaphone className="h-4 w-4" />;
      case "role_management":
        return <Shield className="h-4 w-4" />;
      case "leave_type_management":
        return <Palmtree className="h-4 w-4" />;
      case "leave_request_management":
        return <CalendarClock className="h-4 w-4" />;
      case "read":
        return <BookOpen className="h-4 w-4" />;
      case "create":
        return <BadgePlus className="h-4 w-4" />;
      case "update":
        return <FilePenLine className="h-4 w-4" />;
      case "activate":
        return <BadgeCheck className="h-4 w-4" />;
      case "approve":
        return <CircleCheck className="h-4 w-4" />;
      case "check_in":
        return <LogIn className="h-4 w-4" />;
      case "check_out":
        return <LogOut className="h-4 w-4" />;
      case "deactivate":
        return <Power className="h-4 w-4" />;
      case "report":
        return <ChartColumnBig className="h-4 w-4" />;
      case "create_bulk":
        return <CopyPlus className="h-4 w-4" />;
      case "delete":
        return <Trash className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return isLoading && !isUpdating ? (
    <AssignPermissionSkeleton />
  ) : (
    <>
      <div className="space-y-4 pb-1 overflow-y-auto no-scrollbar max-h-[70vh] overflow-auto">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-0"
        >
          {Object.entries(grouped).map(([group, perms], idx) => (
            <AccordionItem key={group} value={`item-${idx}`}>
              <AccordionTrigger className="hover:no-underline group cursor-pointer">
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted p-1 rounded">{getIcon(group)}</div>
                    <p className="font-semibold capitalize group-hover:underline">
                      {group.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-primary underline-offset-4 hover:underline h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const updated = new Set(selected);
                      const allSelected = perms.every((permission) =>
                        selected.has(permission.uuid),
                      );

                      if (allSelected) {
                        perms.forEach((permission) =>
                          updated.delete(permission.uuid),
                        );
                      } else {
                        perms.forEach((permission) =>
                          updated.add(permission.uuid),
                        );
                      }
                      setSelected(updated);
                    }}
                  >
                    {perms.every((permission) => selected.has(permission.uuid))
                      ? "Revoke all"
                      : "Grant all"}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-3"
                  value={perms
                    .filter((p) => selected.has(p.uuid))
                    .map((p) => p.uuid)}
                  onValueChange={(values) => {
                    const updated = new Set(selected);
                    perms.forEach((p) => updated.delete(p.uuid));
                    values.forEach((value) => updated.add(value));
                    setSelected(updated);
                  }}
                >
                  {perms.map((permission) => (
                    <ToggleGroupItem
                      key={permission.uuid}
                      value={permission.uuid}
                      aria-label={`Toggle ${permission.action}`}
                      className="h-24 w-24 p-2 data-[state=on]:*:[svg]:fill-primary flex flex-col gap-2 items-center justify-center"
                    >
                      {getIcon(permission.action)}
                      <p className="text-[9px] font-bold uppercase tracking-wider">
                        {permission.action.replaceAll("_", " ")}
                      </p>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="flex justify-end gap-2">
        <Button disabled={isLoading} variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          onClick={() => onSave(Array.from(selected))}
        >
          {isUpdating ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Save Permissions"
          )}
        </Button>
      </div>
    </>
  );
}
