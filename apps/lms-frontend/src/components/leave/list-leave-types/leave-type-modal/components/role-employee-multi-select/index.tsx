import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { UserInterface } from "@/features/user/user.slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  type ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
interface SelectedRole {
  uuid: string;
  name: string;
}

interface SelectedUser {
  user_id: string;
  name: string;
  email: string;
}

interface Props<T extends FieldValues> {
  setPendingApplicableFor?: Dispatch<
    SetStateAction<{ roles: string[]; users: string[] }>
  >;
  control: Control<T>;
  name: Path<T>;
  /** Full role objects already applied (e.g. from an edited record), so they can be
   * merged into the option list even if not on the currently loaded page. */
  initialSelectedRoles?: SelectedRole[];
  /** Full user objects already applied — same reasoning as initialSelectedRoles. */
  initialSelectedUsers?: SelectedUser[];
  /** Stable identity (e.g. record uuid, or "new") that changes only when the form
   * should re-seed from initialSelectedRoles/initialSelectedUsers — not on every
   * parent re-render. */
  resetKey?: string;
}

function InfiniteOptionList<T>({
  items,
  getValue,
  getLabel,
  dataLength,
  hasMore,
  onLoadMore,
  scrollHeight = 200,
}: {
  items: T[];
  getValue: (item: T) => string;
  getLabel: (item: T) => ReactNode;
  dataLength: number;
  hasMore: boolean;
  onLoadMore: () => void;
  scrollHeight?: number;
}) {
  const scrollId = useId();

  return (
    <div id={scrollId} style={{ maxHeight: scrollHeight, overflowY: "auto" }}>
      <InfiniteScroll
        dataLength={dataLength}
        next={onLoadMore}
        hasMore={dataLength > 0 && hasMore}
        loader={
          <div className="space-y-1.5 px-2 py-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        }
        scrollableTarget={scrollId}
      >
        {items.map((item) => {
          const value = getValue(item);
          return (
            <MultiSelectItem value={value} key={value}>
              {getLabel(item)}
            </MultiSelectItem>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}

const RoleEmployeeMultiSelect = <T extends FieldValues>({
  setPendingApplicableFor,
  control,
  name,
  initialSelectedRoles,
  initialSelectedUsers,
  resetKey = "new",
}: Props<T>) => {
  const dispatch = useAppDispatch();
  const { getFieldState, formState, getValues, setValue } = useFormContext<T>();
  const { roles } = useAppSelector((state) => state.rolesSlice);
  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"role" | "employee">("role");

  const {
    users,
    isLoading: isUsersLoading,
    total,
    onSearch: setEmployeeSearchTerm,
    onLoadMore: loadMoreEmployees,
  } = useInfiniteUserList(10, activeTab === "employee");

  const [employeeSearchDisplay, setEmployeeSearchDisplay] = useState("");

  const selectedRoleNamesMapRef = useRef<Map<string, string>>(new Map());
  const selectedUserNamesMapRef = useRef<Map<string, string>>(new Map());

  // Seed the name maps from the record being edited whenever we actually
  // switch records (or move from edit -> create), not on every re-render —
  // otherwise names picked mid-session would get clobbered by parent re-renders.
  useEffect(() => {
    selectedRoleNamesMapRef.current = new Map(
      (initialSelectedRoles ?? []).map((r) => [r.uuid, r.name]),
    );
    selectedUserNamesMapRef.current = new Map(
      (initialSelectedUsers ?? []).map((u) => [u.user_id, u.name]),
    );
  }, [resetKey]);

  const watchedValue = useWatch({ control, name }) as
    { roles?: string[]; users?: string[] } | undefined;

  const mergedRoles = useMemo<SelectedRole[]>(() => {
    const base: SelectedRole[] = roles.map((r) => ({
      uuid: r.uuid,
      name: r.name,
    }));
    (initialSelectedRoles ?? []).forEach((r) => {
      if (!base.some((m) => m.uuid === r.uuid)) base.push(r);
    });
    return base;
  }, [roles, initialSelectedRoles]);

  const mergedUsers = useMemo<SelectedUser[]>(() => {
    const base: SelectedUser[] = users.map((u: UserInterface) => ({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
    }));
    (initialSelectedUsers ?? []).forEach((u) => {
      if (!base.some((m) => m.user_id === u.user_id)) base.push(u);
    });
    return base;
  }, [users, initialSelectedUsers]);

  const filteredRoles = mergedRoles.filter((role) =>
    role?.name?.toLowerCase().includes(roleSearchTerm.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!currentOrgUUID || activeTab !== "role") return;
    dispatch(getOrganizationRolesAction({ org_uuid: currentOrgUUID }));
  }, [activeTab, currentOrgUUID, dispatch]);

  const fieldKey = activeTab === "role" ? "roles" : "users";
  const currentValues = watchedValue?.[fieldKey] ?? [];
  const selectedRoles = watchedValue?.roles ?? [];
  const selectedUsers = watchedValue?.users ?? [];

  const handleValuesChange = (values: string[]) => {
    const current =
      (getValues(name) as { roles?: string[]; users?: string[] } | undefined) ??
      {};

    setValue(name, { ...current, [fieldKey]: values } as T[typeof name], {
      shouldDirty: true,
    });

    const namesMapRef =
      activeTab === "role" ? selectedRoleNamesMapRef : selectedUserNamesMapRef;

    const currentIds = current[fieldKey] ?? [];
    const added = values.filter((id) => !currentIds.includes(id));
    const removed = currentIds.filter((id: string) => !values.includes(id));

    added.forEach((id) => {
      const label =
        activeTab === "role"
          ? filteredRoles.find((r) => r.uuid === id)?.name
          : mergedUsers.find((u) => u.user_id === id)?.name;
      if (label) namesMapRef.current.set(id, label);
    });

    removed.forEach((id: string) => namesMapRef.current.delete(id));

    setPendingApplicableFor?.((prev) => ({
      ...prev,
      [fieldKey]: [...namesMapRef.current.values()],
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      <Field className="gap-2">
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => {
            const nestedFieldState = getFieldState(
              `${name}.${fieldKey}` as Path<T>,
              formState,
            );
            const error = nestedFieldState.error;

            return (
              <>
                <div className="flex items-center justify-between">
                  <FieldLabel>
                    Apply Policy To <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as "role" | "employee")
                    }
                    className="scale-90 origin-right"
                  >
                    <TabsList className="h-auto p-1">
                      <TabsTrigger
                        value="role"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Roles
                        {selectedRoles.length > 0 &&
                          ` (${selectedRoles.length})`}
                      </TabsTrigger>
                      <TabsTrigger
                        value="employee"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Employees
                        {selectedUsers.length > 0 &&
                          ` (${selectedUsers.length})`}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <MultiSelect
                  values={currentValues}
                  onValuesChange={handleValuesChange}
                >
                  <MultiSelectTrigger
                    ref={field.ref}
                    className="w-full hover:bg-transparent"
                    aria-invalid={!!fieldState.error}
                  >
                    <MultiSelectValue
                      overflowBehavior="cutoff"
                      placeholder={`Select ${activeTab === "role" ? "Roles" : "Employees"}...`}
                    />
                  </MultiSelectTrigger>

                  <MultiSelectContent
                    search={{
                      emptyMessage: `No ${activeTab}s found.`,
                      placeholder: `Search ${activeTab}s...`,
                    }}
                    searchValue={
                      activeTab === "employee"
                        ? employeeSearchDisplay
                        : roleSearchTerm
                    }
                    onSearch={(value) => {
                      if (activeTab === "employee") {
                        setEmployeeSearchDisplay(value);
                        setEmployeeSearchTerm(value);
                      } else {
                        setRoleSearchTerm(value);
                      }
                    }}
                    isLoading={activeTab === "employee" && isUsersLoading}
                  >
                    {activeTab === "role" && (
                      <div>
                        <Button
                          variant="link"
                          size="sm"
                          className="ml-auto block text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            const allIds = filteredRoles.map((r) => r.uuid);
                            const isAllSelected = allIds.every((id) =>
                              selectedRoles.includes(id),
                            );
                            handleValuesChange(isAllSelected ? [] : allIds);
                          }}
                        >
                          {filteredRoles.every((r) =>
                            selectedRoles.includes(r.uuid),
                          ) && selectedRoles.length > 0
                            ? "Deselect all"
                            : "Select all"}
                        </Button>
                        <Separator />
                      </div>
                    )}

                    <MultiSelectGroup>
                      {activeTab === "employee" ? (
                        <InfiniteOptionList
                          items={mergedUsers}
                          getValue={(u) => u.user_id}
                          getLabel={(u) => `${u.name } (${u.email})`}
                          dataLength={mergedUsers.length}
                          hasMore={users.length < total}
                          onLoadMore={loadMoreEmployees}
                        />
                      ) : (
                        <InfiniteOptionList
                          items={filteredRoles}
                          getValue={(r) => r.uuid}
                          getLabel={(r) => r.name}
                          dataLength={filteredRoles.length}
                          hasMore={false}
                          onLoadMore={() => {}}
                        />
                      )}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>

                <FieldError
                  errors={[fieldState.error, error]}
                  className="text-xs"
                />

                <FieldDescription className="text-xs">
                  Select Roles, Employees, or both — both sets will be applied
                  together.
                </FieldDescription>
              </>
            );
          }}
        />
      </Field>
    </div>
  );
};

export default RoleEmployeeMultiSelect;
