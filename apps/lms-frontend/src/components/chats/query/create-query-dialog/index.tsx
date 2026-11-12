"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";
import { UserInterface } from "@/features/user/user.type";
import { createQueryAction } from "@/features/query/create-query/create-query.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { cn } from "@/lib/utils";
import { getPriorityMeta } from "@/utils/query";
import { QUERY_LIMITS } from "@/features/query/query.constants";
import {
  CreateQueryFormValues,
  QUERY_MODULE_OPTIONS,
  QUERY_PRIORITY_OPTIONS,
  createQueryDefaultValues,
  createQuerySchema,
} from "./create-query.schema";

interface CreateQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgUuid: string;
  /** Called after the query is created, e.g. to refresh the list. */
  onCreated?: () => void;
}

export function CreateQueryDialog({
  open,
  onOpenChange,
  orgUuid,
  onCreated,
}: CreateQueryDialogProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const form = useForm<CreateQueryFormValues>({
    resolver: zodResolver(createQuerySchema),
    defaultValues: createQueryDefaultValues,
  });

  const {
    users: assigneeUsers,
    isLoading: assigneeLoading,
    isLoadingMore: assigneeLoadingMore,
    count: assigneeCount,
    onSearch: onAssigneeSearch,
    onLoadMore: onAssigneeLoadMore,
  } = useInfiniteUserList(10, assigneeOpen, "true");

  // Start from a clean form every time the dialog opens.
  useEffect(() => {
    if (open) form.reset(createQueryDefaultValues);
  }, [form, open]);

  const onSubmit = async (values: CreateQueryFormValues) => {
    if (!orgUuid || !currentUser?.user_id) return;

    const result = await dispatch(
      createQueryAction({
        org_uuid: orgUuid,
        data: {
          assignee_ids: values.assignee_ids,
          subject: values.subject,
          description: values.description,
          module: values.module,
          priority: values.priority,
          resolved_at: null,
          initial_message: values.description,
        },
      }),
    );

    if (createQueryAction.fulfilled.match(result)) {
      onOpenChange(false);
      onCreated?.();
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isSubmitting && onOpenChange(next)}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">New query</DialogTitle>
          <DialogDescription>
            Describe the issue and pick who should handle it. The conversation
            continues in the chat.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Short summary of the issue"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-start gap-2">
                    <FormMessage />
                    <CharacterCount
                      value={field.value}
                      max={QUERY_LIMITS.SUBJECT_MAX}
                    />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue or request in detail"
                      className="max-h-60 min-h-28 [overflow-wrap:anywhere]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-start gap-2">
                    <FormMessage />
                    <CharacterCount
                      value={field.value}
                      max={QUERY_LIMITS.DESCRIPTION_MAX}
                    />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignee_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Assignees <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InfiniteMultiSelect
                      value={field.value}
                      onValuesChange={field.onChange}
                      onOpenChange={(isOpen) => {
                        setAssigneeOpen(isOpen);
                        if (!isOpen) field.onBlur();
                      }}
                      data={assigneeUsers}
                      total={assigneeCount}
                      isLoading={assigneeLoading}
                      isLoadingMore={assigneeLoadingMore}
                      onSearch={onAssigneeSearch}
                      onLoadMore={onAssigneeLoadMore}
                      getValue={(user: UserInterface) => user.user_id}
                      getLabel={(user: UserInterface) =>
                        `${user.name} (${user.email})`
                      }
                      placeholder="Select assignees"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUERY_MODULE_OPTIONS.map((module) => (
                          <SelectItem key={module} value={module}>
                            {module}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUERY_PRIORITY_OPTIONS.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  getPriorityMeta(priority).dot,
                                )}
                              />
                              {priority}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !currentUser?.user_id}
              >
                {isSubmitting && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create query
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** "120 / 255" under a field; turns red past the limit. Counts trimmed text, like the validation. */
function CharacterCount({ value, max }: { value?: string; max: number }) {
  const length = (value ?? "").trim().length;
  return (
    <span
      className={cn(
        "ml-auto shrink-0 text-xs tabular-nums text-muted-foreground",
        length > max && "font-medium text-destructive",
      )}
    >
      {length.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}

export default CreateQueryDialog;
