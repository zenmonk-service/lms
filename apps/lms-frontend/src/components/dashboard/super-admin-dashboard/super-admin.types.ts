import z from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;

export const platformAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s'-]+$/, "Name must contain only alphabets and spaces")
    .max(50, "Name must be 50 characters or fewer"),

  email: z
    .string()
    .trim()
    .nonempty("Email is required")
    .email("Enter a valid email address")
    .max(50, "Email must be 50 characters or fewer"),

  password: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        (value.length <= 255 && passwordRegex.test(value)),
      {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }
    ),
});

export type PlatformAdminFormValues = z.infer<typeof platformAdminSchema>;
