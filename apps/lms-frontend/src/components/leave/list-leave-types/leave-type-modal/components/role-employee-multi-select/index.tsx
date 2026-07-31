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
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { resetUsers, UserInterface } from "@/features/user/user.slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { LoaderCircle } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext,
  useWatch,
} from "react-hook-form";
interface Props<T extends FieldValues> {
  setPendingApplicableFor?: Dispatch<
    SetStateAction<{
      roles: string[];
      users: string[];
    }>
  >;
  control: Control<T>;
  name: Path<T>;
}

const RoleEmployeeMultiSelect = <T extends FieldValues>({
  setPendingApplicableFor,
  control,
  name,
}: Props<T>) => {
  const dispatch = useAppDispatch();
  const { getFieldState, formState, getValues, setValue } = useFormContext<T>();

  const {
    users,
    isLoading: isUsersLoading,
    total,
  } = useAppSelector((state) => state.userSlice);
  const { roles } = useAppSelector((state) => state.rolesSlice);
  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"role" | "employee">("role");

  const employeePageRef = useRef(1);
  const loadedQueryKeyRef = useRef("");
  const selectedRoleNamesMapRef = useRef<Map<string, string>>(new Map());
  const selectedUserNamesMapRef = useRef<Map<string, string>>(new Map());

  // IMPORTANT: this is the reactive, always-fresh read of the parent object.
  // It mirrors getValues()/other Controllers' state, unlike a sibling
  // Controller's `field.value`, which only updates on that Controller's own
  // render cycle and goes stale when a sibling path (e.g. `isApplicable`,
  // `accrual_period`) is updated elsewhere in the tree.
  const watchedValue = useWatch({ control, name }) as
    | { roles?: string[]; users?: string[] }
    | undefined;

  const filteredRoles = roles.filter((role) =>
    role?.name?.toLowerCase().includes(roleSearchTerm.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!currentOrgUUID) return;

    if (activeTab === "role") {
      dispatch(getOrganizationRolesAction({ org_uuid: currentOrgUUID }));
      return;
    }

    const normalizedSearch = employeeSearchTerm.trim();
    const queryKey = `${currentOrgUUID}::${normalizedSearch}`;

    if (loadedQueryKeyRef.current === queryKey && users.length > 0) return;

    employeePageRef.current = 1;
    dispatch(resetUsers());
    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: normalizedSearch },
        org_uuid: currentOrgUUID,
        isInfiniteScroll: true,
      }),
    );
    loadedQueryKeyRef.current = queryKey;
  }, [activeTab, currentOrgUUID, dispatch, employeeSearchTerm, users.length]);

  const handleEmployeeSearch = (value: string) => {
    employeePageRef.current = 1;
    setEmployeeSearchTerm(value);
  };

  const loadMoreEmployees = () => {
    if (
      activeTab !== "employee" ||
      isUsersLoading ||
      users.length >= total ||
      !currentOrgUUID
    )
      return;

    const nextPage = employeePageRef.current + 1;
    employeePageRef.current = nextPage;

    dispatch(
      listUserAction({
        pagination: {
          page: nextPage,
          limit: 10,
          search: employeeSearchTerm.trim(),
        },
        org_uuid: currentOrgUUID,
        isInfiniteScroll: true,
      }),
    );
  };

  const fieldKey = activeTab === "role" ? "roles" : "users";
  const currentValues = watchedValue?.[fieldKey] ?? [];
  const selectedRoles = watchedValue?.roles ?? [];
  const selectedUsers = watchedValue?.users ?? [];

  const handleValuesChange = (values: string[]) => {
    // Always merge onto a value fetched fresh right now — never onto a
    // Controller's `field.value` closure, which can be stale relative to
    // sibling fields that were just updated via their own setValue/onChange.
    const current = (getValues(name) as
      | { roles?: string[]; users?: string[] }
      | undefined) ?? {};

    setValue(
      name,
      { ...current, [fieldKey]: values } as T[typeof name],
      { shouldDirty: true, shouldValidate: true, shouldTouch: true },
    );

    const namesMapRef =
      activeTab === "role" ? selectedRoleNamesMapRef : selectedUserNamesMapRef;

    const currentIds = current[fieldKey] ?? [];
    const added = values.filter((id) => !currentIds.includes(id));
    const removed = currentIds.filter((id: string) => !values.includes(id));

    added.forEach((id) => {
      const label =
        activeTab === "role"
          ? filteredRoles.find((r) => r.uuid === id)?.name
          : users.find((u: UserInterface) => u.user_id === id)?.name;
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
            // NOTE: `field.value` is intentionally NOT used for reads or
            // merges below. It's only used for `field.ref` (to wire up the
            // trigger for focus/blur/validation). All value reads go through
            // `watchedValue` (via useWatch) or fresh `getValues()` calls.
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
                        {selectedRoles.length > 0 && ` (${selectedRoles.length})`}
                      </TabsTrigger>
                      <TabsTrigger
                        value="employee"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Employees
                        {selectedUsers.length > 0 && ` (${selectedUsers.length})`}
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
                    className={`w-full hover:bg-transparent`}
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
                        ? employeeSearchTerm
                        : roleSearchTerm
                    }
                    onSearch={(value) => {
                      const next =
                        typeof value === "function"
                          ? value(
                              activeTab === "employee"
                                ? employeeSearchTerm
                                : roleSearchTerm,
                            )
                          : value;
                      activeTab === "employee"
                        ? handleEmployeeSearch(next)
                        : setRoleSearchTerm(next);
                    }}
                    isLoading={isUsersLoading}
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
                      <InfiniteScroll
                        dataLength={
                          activeTab === "employee"
                            ? users.length
                            : filteredRoles.length
                        }
                        next={loadMoreEmployees}
                        hasMore={
                          activeTab === "employee" ? users.length < total : false
                        }
                        loader={
                          <LoaderCircle className="animate-spin mx-auto my-2 w-4 h-4" />
                        }
                        height={150}
                        className="max-h-37.5"
                      >
                        {activeTab === "employee"
                          ? users.map((user: UserInterface) => (
                              <MultiSelectItem
                                value={user.user_id}
                                key={user.user_id}
                              >
                                {user.name}
                              </MultiSelectItem>
                            ))
                          : filteredRoles.map((role) => (
                              <MultiSelectItem value={role.uuid} key={role.uuid}>
                                {role.name}
                              </MultiSelectItem>
                            ))}
                      </InfiniteScroll>
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>

                <FieldError errors={[fieldState.error, error]} className="text-xs" />

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