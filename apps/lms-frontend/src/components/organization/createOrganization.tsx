// Refactored CreateOrganizationForm using Field, InputGroup, Dialog-style UI

"use client";

import React from "react";
import { useForm } from "react-hook-form";
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
    .string().trim()
    .nonempty("Domain is required")
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  website: z.string().trim().nonempty("Website is required").url("Invalid website URL"),
  description: z.string().trim().optional(),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function CreateOrganizationForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: OrgFormValues) => void;
  isSubmitting?: boolean;
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

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-5 p-2 max-h-[75vh] overflow-y-auto"
    >
      {/* Organization Name */}
      <Field className="gap-1" data-invalid={!!form.formState.errors.name}>
        <FieldLabel>Organization Name</FieldLabel>
        <Input
          {...form.register("name")}
          placeholder="e.g. ZenMonk Technologies"
          className={`${
            form.formState.errors.name ? "border-red-400" : "border-gray-200"
          }`}
        />
        {form.formState.errors.name && (
          <FieldError errors={[form.formState.errors.name]} className="text-xs"/>
        )}
      </Field>

      {/* Domain */}
      <Field className="gap-1" data-invalid={!!form.formState.errors.domain}>
        <FieldLabel>Domain</FieldLabel>
        <Input
          {...form.register("domain")}
          placeholder="e.g. zenmonk.com"
          className={`${form.formState.errors.domain ? 'border-red-400' : 'border-gray-200'}`}
        />
        {form.formState.errors.domain && (
          <FieldError errors={[form.formState.errors.domain]} className="text-xs"/>
        )}
      </Field>

      {/* Website */}
      <Field className="gap-1" data-invalid={!!form.formState.errors.website}>
        <FieldLabel>Website</FieldLabel>
        <Input
          {...form.register("website")}
          placeholder="https://zenmonk.com"
          className={`${form.formState.errors.website ? 'border-red-400' : 'border-gray-200'}`}
        />
        {form.formState.errors.website && (
          <FieldError errors={[form.formState.errors.website]} className="text-xs"/>
        )}
      </Field>

      {/* Description */}
      <Field className="gap-1 truncate" data-invalid={!!form.formState.errors.description}>
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
          <FieldError errors={[form.formState.errors.description]} className="text-xs"/>
        )}
      </Field>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full  text-white rounded-md shadow"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          "Create Organization"
        )}
      </Button>
    </form>
  );
}
