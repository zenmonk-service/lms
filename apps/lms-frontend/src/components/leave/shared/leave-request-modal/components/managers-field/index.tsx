import { LeaveRequestFormData } from "@/components/leave/leave.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Managers } from "@/features/leave/leave.types";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface IProps {
  open: boolean;
  existingManagers?: Managers[];
}

const ManagersField = ({ open, existingManagers }: IProps) => {
  const dispatch = useAppDispatch();
  const { control } = useFormContext<LeaveRequestFormData>();

  const {
    users,
    isLoading: isUsersLoading,
    isLoadingMore: isUsersLoadingMore,
    total,
    count,
    currentPage,
    currentUser,
  } = useAppSelector((state) => state.userSlice);
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [managerSelectOpened, setManagerSelectOpened] = useState(false);

  useEffect(() => {
    if (!open || !managerSelectOpened) return;

    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid,
        isInfiniteScroll: false,
        managers_required: true,
      }),
    );
  }, [searchTerm, org_uuid, open, managerSelectOpened, dispatch]);

  const managerOptions = useMemo(() => {
    const base = users.filter((u) => u.user_id !== currentUser.user_id);

    const existing = (existingManagers ?? [])
      .map((m) => m.user)
      .filter((u) => u.user_id !== currentUser.user_id);

    const merged = [...base];
    existing.forEach((u) => {
      if (!merged.some((m) => m.user_id === u.user_id)) {
        merged.push(u);
      }
    });

    return merged;
  }, [users, existingManagers, currentUser]);

  return (
    <Controller
      name="managers"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1">
          <FieldLabel>
            Apply To <span className="text-destructive">*</span>
          </FieldLabel>
          <InfiniteMultiSelect
            value={field.value}
            onValuesChange={field.onChange}
            onOpenChange={(isOpen) => {
              if (isOpen) setManagerSelectOpened(true);
            }}
            data={managerOptions}
            total={count - 1}
            isLoading={isUsersLoading}
            isLoadingMore={isUsersLoadingMore}
            onSearch={setSearchTerm}
            getValue={(u) => u.user_id}
            getLabel={(u) => `${u.name} (${u.email})`}
            onLoadMore={() => {
              if (isUsersLoading || users.length >= total) return;

              dispatch(
                listUserAction({
                  pagination: {
                    page: currentPage + 1,
                    limit: 10,
                    search: searchTerm,
                  },
                  org_uuid,
                  isInfiniteScroll: true,
                }),
              );
            }}
            placeholder="Select managers..."
            ref={field.ref}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} className="text-xs" />
        </Field>
      )}
    />
  );
};

export default ManagersField;
