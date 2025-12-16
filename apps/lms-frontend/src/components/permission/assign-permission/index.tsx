"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Permission } from "@/features/permissions/permission.slice";
import { LoaderCircle, StarIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function RolePermissionForm({
  permissions,
  selectedPermissions = [],
  onSave,
  isLoading = false,
}: {
  permissions: Permission[];
  selectedPermissions?: Permission[];
  onSave: (permissionIds: string[]) => void;
  isLoading?: boolean;
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

  return isLoading ? (
    <div className="flex items-center justify-center h-[400px]">
      <LoaderCircle className="animate-spin h-4 w-4" />
    </div>
  ) : (
    <>
      <div className="space-y-6 h-full pb-1 overflow-y-auto no-scrollbar">
        {Object.entries(grouped).map(([group, perms]) => (
          <Card key={group}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                {/* Use a ref to set indeterminate manually */}

                <CardTitle className="capitalize">
                  {group.replace(/_/g, " ")}
                </CardTitle>

                <div className="flex items-center gap-2.5">
                  <label
                    className="flex items-center space-x-2 cursor-pointer underline"
                    htmlFor={`select-all-${group}`}
                  >
                    All
                  </label>
                  <Checkbox
                    id={`select-all-${group}`}
                    checked={perms.every((permission) =>
                      selected.has(permission.uuid)
                    )}
                    ref={(el) => {
                      const input = el as HTMLInputElement | null;
                      if (input) {
                        input.indeterminate =
                          perms.some((permission) =>
                            selected.has(permission.uuid)
                          ) &&
                          !perms.every((permission) =>
                            selected.has(permission.uuid)
                          );
                      }
                    }}
                    onCheckedChange={(checked) => {
                      const updated = new Set(selected);
                      if (checked) {
                        perms.forEach((permission) =>
                          updated.add(permission.uuid)
                        );
                      } else {
                        perms.forEach((permission) =>
                          updated.delete(permission.uuid)
                        );
                      }
                      setSelected(updated);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-wrap gap-4">
              <div className="flex">
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  size="sm"
                  value={perms.filter((p) => selected.has(p.uuid)).map((p) => p.uuid)}
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
                      aria-label="Toggle star"
                      className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-orange-500 data-[state=on]:*:[svg]:stroke-orange-500"
                    >
                      <StarIcon className="h-4 w-4 mr-2" />
                      {permission.action.charAt(0).toUpperCase() +
                        permission.action.slice(1)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        disabled={isLoading}
        onClick={() => onSave(Array.from(selected))}
        className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
      >
        {isLoading ? <LoaderCircle className="animate-spin" /> : "Save Permissions"}
      </Button>
    </>
  );
}
