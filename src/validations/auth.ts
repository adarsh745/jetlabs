/**
 * Zod validation schema for authentication.
 * Used in both API routes (server validation) and forms (client validation).
 */
import { z } from "zod";

const emailAddressSchema = z.string().email("Enter a valid email address");

function trimString(value: string) {
  return value.trim();
}

function normalizeEmail(value: string) {
  return trimString(value).toLowerCase();
}

export const loginSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .transform(({ email, password }) => ({
    email: normalizeEmail(email),
    password: trimString(password),
  }))
  .superRefine((value, ctx) => {
    if (!value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required",
      });
    } else if (!emailAddressSchema.safeParse(value.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid email address",
      });
    }

    if (!value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;

export const loginFieldOrder = ["email", "password"] as const;
export type LoginField = (typeof loginFieldOrder)[number];
export type LoginValidationErrors = Partial<Record<LoginField, string>>;

function getLoginValidationErrors(error: z.ZodError<LoginInput>) {
  const errors: LoginValidationErrors = {};

  for (const field of loginFieldOrder) {
    const message = error.issues.find((issue) => issue.path[0] === field)?.message;

    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function validateLoginInput(input: LoginInput):
  | {
      success: true;
      data: LoginInput;
    }
  | {
      success: false;
      data: LoginInput;
      errors: LoginValidationErrors;
      firstField: LoginField | null;
    } {
  const result = loginSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const data: LoginInput = {
    email: normalizeEmail(input.email),
    password: trimString(input.password),
  };
  const errors = getLoginValidationErrors(result.error);
  const firstField = loginFieldOrder.find((field) => errors[field]) ?? null;

  return {
    success: false,
    data,
    errors,
    firstField,
  };
}

export function validateLoginField(field: LoginField, input: LoginInput) {
  const result = validateLoginInput(input);

  if (result.success) {
    return undefined;
  }

  return result.errors[field];
}
