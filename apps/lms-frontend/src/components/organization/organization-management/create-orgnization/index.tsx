// Refactored CreateOrganizationForm using Field, InputGroup, Dialog-style UI

"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store";
import { Loader2 } from "lucide-react";

const orgSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required"),
  domain: z
    .string()
    .trim()
    .nonempty("Domain is required")
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  website: z
    .string()
    .trim()
    .nonempty("Website is required")
    .url("Invalid website URL"),
  description: z.string().trim().optional(),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function CreateOrganizationForm({
  onOpenChange,
  onSubmit,
}: {
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OrgFormValues) => void;
}) {
  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      domain: "",
      website: "",
      description: "",
    },
  });

  const { isLoading } = useAppSelector((state) => state.organizationsSlice);

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-5 p-2 max-h-[75vh] overflow-y-auto"
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <FieldLabel>Organization Name</FieldLabel>
            <Input
              {...field}
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. ZenMonk Technologies"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="text-xs" />
            )}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="domain"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <FieldLabel>Domain</FieldLabel>
            <Input
              {...field}
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. zenmonk.com"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="text-xs" />
            )}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="website"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <FieldLabel>Website</FieldLabel>
            <Input
              {...field}
              value={field.value}
              onChange={field.onChange}
              placeholder="https://zenmonk.com"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="text-xs" />
            )}
          </Field>
        )}
      />

      <Field
        className="gap-1 truncate"
        data-invalid={!!form.formState.errors.description}
      >
        <FieldLabel>Description</FieldLabel>
        <InputGroup>
          <InputGroupTextarea
            {...form.register("description")}
            placeholder="Short description about your organization"
            rows={6}
            maxLength={500}
            aria-invalid={form.formState.errors.description ? "true" : "false"}
            className={`resize-none min-h-24`}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText className="tabular-nums">
              {form.watch("description")?.length || 0}/500
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Briefly describe the organization.</FieldDescription>
        {form.formState.errors.description && (
          <FieldError
            errors={[form.formState.errors.description]}
            className="text-xs"
          />
        )}
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Create"}
        </Button>
      </div>
    </form>
  );
}
