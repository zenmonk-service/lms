import { z } from "zod";
import { QueryModule, QueryPriority } from "@repo/common";
import { QUERY_LIMITS } from "@/features/query/query.constants";

export const QUERY_MODULE_OPTIONS = Object.values(QueryModule.ENUM);
export const QUERY_PRIORITY_OPTIONS = Object.values(QueryPriority.ENUM);

export const createQuerySchema = z.object({
  // Limits mirror the backend (QUERY_LIMITS). Ticket number and creator are set by the backend.
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(
      QUERY_LIMITS.SUBJECT_MAX,
      `Subject must be ${QUERY_LIMITS.SUBJECT_MAX} characters or fewer`,
    ),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(
      QUERY_LIMITS.DESCRIPTION_MAX,
      `Description must be ${QUERY_LIMITS.DESCRIPTION_MAX.toLocaleString()} characters or fewer`,
    ),

  assignee_ids: z
    .array(z.string())
    .min(1, "Select at least one assignee")
    .max(
      QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX,
      `Select at most ${QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX} assignees`,
    ),

  module: z.enum(QUERY_MODULE_OPTIONS as [string, ...string[]], {
    message: "Select a module",
  }),

  priority: z.enum(QUERY_PRIORITY_OPTIONS as [string, ...string[]], {
    message: "Select a priority",
  }),
});

export type CreateQueryFormValues = z.infer<typeof createQuerySchema>;

export const createQueryDefaultValues: CreateQueryFormValues = {
  subject: "",
  description: "",
  assignee_ids: [],
  module: QueryModule.ENUM.OTHER,
  priority: QueryPriority.ENUM.MEDIUM,
};
