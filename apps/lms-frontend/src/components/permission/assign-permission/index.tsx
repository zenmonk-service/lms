"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Permission } from "@/features/permissions/permission.slice";
import {
  BadgeCheck,
  BadgePlus,
  BookOpen,
  CalendarClock,
  CircleCheck,
  FilePenLine,
  LoaderCircle,
  Palmtree,
  Shield,
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
    {}
  );

  const [selected, setSelected] = useState(
    new Set(selectedPermissions.map((perm) => perm.uuid))
  );

  useEffect(() => {
    setSelected(new Set(selectedPermissions.map((perm) => perm.uuid)));
  }, [selectedPermissions]);

  return isLoading && !isUpdating ? (
    <AssignPermissionSkeleton />
  ) : (
    <>
      <div className="space-y-4 h-full pb-1 overflow-y-auto no-scrollbar">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-0"
        >
          {Object.entries(grouped).map(([group, perms], idx) => (
            <AccordionItem key={group} value={`item-${idx}`}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted p-1 rounded">
                      {group === "user_management" && (
                        <UserCog className="h-4 w-4" />
                      )}
                      {group === "role_management" && (
                        <Shield className="h-4 w-4" />
                      )}
                      {group === "leave_type_management" && (
                        <Palmtree className="h-4 w-4" />
                      )}
                      {group === "leave_request_management" && (
                        <CalendarClock className="h-4 w-4" />
                      )}
                    </div>
                    <p className="font-semibold capitalize">
                      {group.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div
                    className="text-xs font-medium text-primary cursor-pointer bg-accent hover:bg-accent-foreground transition-colors rounded-md py-1 px-2 no-underline!"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const updated = new Set(selected);
                      const allSelected = perms.every((permission) =>
                        selected.has(permission.uuid)
                      );

                      if (allSelected) {
                        perms.forEach((permission) =>
                          updated.delete(permission.uuid)
                        );
                      } else {
                        perms.forEach((permission) =>
                          updated.add(permission.uuid)
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
                      className="h-20 w-20 p-4 data-[state=on]:*:[svg]:fill-primary flex flex-col gap-2 items-center justify-center"
                    >
                      {permission.action === "read" && (
                        <BookOpen className="" />
                      )}
                      {permission.action === "create" && (
                        <BadgePlus className="" />
                      )}
                      {permission.action === "update" && (
                        <FilePenLine className="" />
                      )}
                      {permission.action === "activate" && (
                        <BadgeCheck className="" />
                      )}
                      {permission.action === "approve" && (
                        <CircleCheck className="" />
                      )}
                      <p className="text-[9px] font-bold uppercase tracking-wider">
                        {permission.action}
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
