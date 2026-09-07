import { LeaveTypeFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import CustomSelect from "@/shared/select";
import Collapse from "@/shared/motion/collapse";
import { useAppDispatch, useAppSelector } from "@/store";
import { ArrowRightLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

interface IProps {
  /** uuid of the leave type being edited, so it can't transfer to itself. */
  currentLeaveTypeUuid?: string;
}

const Transferable = ({ currentLeaveTypeUuid }: IProps) => {
  const dispatch = useAppDispatch();
  const { control, setValue } = useFormContext<LeaveTypeFormData>();

  const orgUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const { leaveTypes, leaveTypesLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );

  const isApplicable = useWatch({
    control,
    name: "transfer_to.is_applicable",
  });

  // Leave types are only fetched once the select has been opened.
  const [optionsOpened, setOptionsOpened] = useState(false);
  useEffect(() => {
    if (optionsOpened && orgUuid) {
      dispatch(listLeaveTypesAction({ org_uuid: orgUuid }));
    }
  }, [optionsOpened, orgUuid, dispatch]);

  const options = leaveTypes.filter(
    (lt) => lt.is_active && lt.uuid !== currentLeaveTypeUuid,
  );

  const handleApplicableChange = (
    checked: boolean,
    onChange: (value: boolean) => void,
  ) => {
    onChange(checked);
    if (!checked) {
      setValue("transfer_to.transfer_leave_type_uuid", null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <FieldLabel htmlFor="switch-transferable">
      <Field orientation="horizontal">
        <FieldContent className="min-w-0">
          <div className="flex gap-2 min-w-0">
            <div className="bg-muted p-2 rounded-lg h-fit shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <FieldTitle className="font-semibold whitespace-normal wrap-break-word">
                Transferable
              </FieldTitle>
              <FieldDescription className="text-xs whitespace-normal wrap-break-word">
                Optionally move unused balance of this leave type into another
                one.
              </FieldDescription>

              <Collapse open={Boolean(isApplicable)}>
                <Controller
                  name="transfer_to.transfer_leave_type_uuid"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1 mt-4 min-w-0">
                      <FieldLabel>
                        Transfer To <span className="text-destructive">*</span>
                      </FieldLabel>
                      <CustomSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        onOpenChange={(open) => {
                          if (open) setOptionsOpened(true);
                        }}
                        data={options}
                        isLoading={leaveTypesLoading && leaveTypes.length === 0}
                        getValue={(item) => item.uuid}
                        getLabel={(item) => item.name}
                        label="Leave Type"
                        placeholder="Select a leave type"
                        className="w-full"
                        aria-invalid={!!fieldState.error}
                        onReset={() => field.onChange(null)}
                      />
                      <FieldDescription className="text-xs whitespace-normal wrap-break-word">
                        Unused balance will be added to the selected leave type.
                      </FieldDescription>
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    </Field>
                  )}
                />
              </Collapse>
            </div>
          </div>
        </FieldContent>

        <Controller
          name="transfer_to.is_applicable"
          control={control}
          render={({ field }) => (
            <Switch
              id="switch-transferable"
              className="shrink-0"
              checked={field.value}
              onCheckedChange={(checked) =>
                handleApplicableChange(checked, field.onChange)
              }
            />
          )}
        />
      </Field>
    </FieldLabel>
  );
};

export default Transferable;
