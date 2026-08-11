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
import { LoaderCircle } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { type ReactNode, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
    SetStateAction<{ roles: string[]; users: string[] }>
  >;
  control: Control<T>;
  name: Path<T>;
}

function InfiniteOptionList<T>({
  items,
  getValue,
  getLabel,
  dataLength,
  hasMore,
  onLoadMore,
  scrollHeight = 150,
}: {
  items: T[];
  getValue: (item: T) => string;
  getLabel: (item: T) => ReactNode;
  dataLength: number;
  hasMore: boolean;
  onLoadMore: () => void;
  scrollHeight?: number;
}) {
  return (
    <InfiniteScroll
      dataLength={dataLength}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<LoaderCircle className="animate-spin mx-auto my-2 w-4 h-4" />}
      height={scrollHeight}
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
  );
}

const RoleEmployeeMultiSelect = <T extends FieldValues>({
  setPendingApplicableFor,
  control,
  name,
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

  const watchedValue = useWatch({ control, name }) as
    | { roles?: string[]; users?: string[] }
    | undefined;

  const filteredRoles = roles.filter((role) =>
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
      (getValues(name) as { roles?: string[]; users?: string[] } | undefined) ?? {};

    setValue(name, { ...current, [fieldKey]: values } as T[typeof name], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
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
                    onValueChange={(value) => setActiveTab(value as "role" | "employee")}
                    className="scale-90 origin-right"
                  >
                    <TabsList className="h-auto p-1">
                      <TabsTrigger value="role" className="px-3 py-1 text-xs font-medium">
                        Roles
                        {selectedRoles.length > 0 && ` (${selectedRoles.length})`}
                      </TabsTrigger>
                      <TabsTrigger value="employee" className="px-3 py-1 text-xs font-medium">
                        Employees
                        {selectedUsers.length > 0 && ` (${selectedUsers.length})`}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <MultiSelect values={currentValues} onValuesChange={handleValuesChange}>
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
                    searchValue={activeTab === "employee" ? employeeSearchDisplay : roleSearchTerm}
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
                          {filteredRoles.every((r) => selectedRoles.includes(r.uuid)) &&
                          selectedRoles.length > 0
                            ? "Deselect all"
                            : "Select all"}
                        </Button>
                        <Separator />
                      </div>
                    )}

                    <MultiSelectGroup>
                      {activeTab === "employee" ? (
                        <InfiniteOptionList
                          items={users}
                          getValue={(u: UserInterface) => u.user_id}
                          getLabel={(u: UserInterface) => u.name}
                          dataLength={users.length}
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

                <FieldError errors={[fieldState.error, error]} className="text-xs" />

                <FieldDescription className="text-xs">
                  Select Roles, Employees, or both — both sets will be applied together.
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