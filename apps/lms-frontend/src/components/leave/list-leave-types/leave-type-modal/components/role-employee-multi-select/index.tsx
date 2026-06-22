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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { resetUsers, UserInterface } from "@/features/user/user.slice";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { LeaveTypeFormData } from "@/components/leave/leave.types";
import { LoaderCircle } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { Separator } from "@/components/ui/separator";

interface IProps {
  setPendingApplicableFor: Dispatch<SetStateAction<string[]>>;
}

const RoleEmployeeMultiSelect = ({ setPendingApplicableFor }: IProps) => {
  const { control } = useFormContext<LeaveTypeFormData>();

  const dispatch = useAppDispatch();

  const {
    users,
    isLoading: isUsersLoading,
    total,
  } = useAppSelector((state) => state.userSlice);
  const { roles } = useAppSelector((state) => state.rolesSlice);
  const currentOrgUUID = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);

  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [applicableFor, setApplicableFor] = useState<"role" | "employee">("role");

  const employeePageRef = useRef(1);
  const loadedQueryKeyRef = useRef("");
  const selectedNamesMapRef = useRef<Map<string, string>>(new Map());

  const filteredRoles = roles.filter((role) => role?.name?.toLowerCase().includes(roleSearchTerm.trim().toLowerCase()));

  useEffect(() => {
    if (!currentOrgUUID) return;

    if (applicableFor === "role") {
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
  }, [
    applicableFor,
    currentOrgUUID,
    dispatch,
    employeeSearchTerm,
    users.length,
  ]);

  const handleEmployeeSearch = (value: string) => {
    employeePageRef.current = 1;
    setEmployeeSearchTerm(value);
  };

  const loadMoreEmployees = () => {
    if (
      applicableFor !== "employee" ||
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

  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      <Field className="gap-2">
        <Controller
          name="applicable_for"
          control={control}
          render={({ field, fieldState }) => {
            const handleValuesChange = (values: string[]) => {
              field.onChange({ type: applicableFor, value: values });

              const currentIds: string[] = field.value.value ?? [];
              const added = values.filter((id) => !currentIds.includes(id));
              const removed = currentIds.filter((id) => !values.includes(id));

              added.forEach((id) => {
                const name =
                  applicableFor === "role"
                    ? filteredRoles.find((r) => r.uuid === id)?.name
                    : users.find((u: UserInterface) => u.user_id === id)?.name;
                if (name) selectedNamesMapRef.current.set(id, name);
              });

              removed.forEach((id) => selectedNamesMapRef.current.delete(id));

              setPendingApplicableFor([
                ...selectedNamesMapRef.current.values(),
              ]);
            };

            return (
              <>
                <div className="flex items-center justify-between">
                  <FieldLabel>
                    Apply Policy To <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Tabs
                    value={applicableFor}
                    onValueChange={(value) => {
                      const next = value as "role" | "employee";
                      setApplicableFor(next);
                      field.onChange({ type: next, value: [] });
                      selectedNamesMapRef.current.clear();
                    }}
                    className="scale-90 origin-right"
                  >
                    <TabsList className="h-auto p-1">
                      <TabsTrigger
                        value="role"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Roles
                      </TabsTrigger>
                      <TabsTrigger
                        value="employee"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        Employees
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <MultiSelect
                  values={field.value.value}
                  onValuesChange={handleValuesChange}
                >
                  <MultiSelectTrigger
                    ref={field.ref}
                    className={`w-full hover:bg-transparent ${
                      fieldState.invalid
                        ? "border-destructive ring-destructive"
                        : ""
                    }`}
                  >
                    <MultiSelectValue
                      overflowBehavior="cutoff"
                      placeholder={`Select ${applicableFor === "role" ? "Roles" : "Employees"}...`}
                    />
                  </MultiSelectTrigger>

                  <MultiSelectContent
                    search={{
                      emptyMessage: `No ${applicableFor}s found.`,
                      placeholder: `Search ${applicableFor}s...`,
                    }}
                    searchValue={
                      applicableFor === "employee"
                        ? employeeSearchTerm
                        : roleSearchTerm
                    }
                    onSearch={(value) => {
                      const next = typeof value === "function" ? value(applicableFor === "employee" ? employeeSearchTerm : roleSearchTerm) : value;
                      applicableFor === "employee" ? handleEmployeeSearch(next) : setRoleSearchTerm(next);
                    }}
                    isLoading={isUsersLoading}
                  >
                    {applicableFor === "role" && (
                      <div>
                        <Button
                          variant="link"
                          size="sm"
                          className="ml-auto block text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            const allIds = filteredRoles.map((r) => r.uuid);
                            const isAllSelected = allIds.every((id) =>
                              field.value.value?.includes(id),
                            );
                            handleValuesChange(isAllSelected ? [] : allIds);
                          }}
                        >
                          {filteredRoles.every((r) => field.value.value?.includes(r.uuid)) && field.value.value.length > 0 ? "Deselect all" : "Select all"}
                        </Button>
                        <Separator />
                      </div>
                    )}

                    <MultiSelectGroup>
                      <InfiniteScroll
                        dataLength={
                          applicableFor === "employee"
                            ? users.length
                            : filteredRoles.length
                        }
                        next={loadMoreEmployees}
                        hasMore={
                          applicableFor === "employee"
                            ? users.length < total
                            : false
                        }
                        loader={
                          <LoaderCircle className="animate-spin mx-auto my-2 w-4 h-4" />
                        }
                        height={150}
                        className="max-h-37.5"
                      >
                        {applicableFor === "employee"
                          ? users.map((user: UserInterface) => (
                              <MultiSelectItem
                                value={user.user_id}
                                key={user.user_id}
                              >
                                {user.name}
                              </MultiSelectItem>
                            ))
                          : filteredRoles.map((role) => (
                              <MultiSelectItem
                                value={role.uuid}
                                key={role.uuid}
                              >
                                {role.name}
                              </MultiSelectItem>
                            ))}
                      </InfiniteScroll>
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>

                <FieldError errors={[fieldState.error]} className="text-xs" />

                <FieldDescription className="text-xs">
                  Note: Select either Roles or Employees. Only the selected tab
                  values will be applied.
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
