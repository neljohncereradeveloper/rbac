import { z } from "zod"

/** Aligned with server CreateUserDto/UpdateUserDto OptionalStringValidation */
const optionalNameString = (maxLen = 100) =>
  z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || /^[a-zA-Z\s\-'.,]+$/.test(v.trim()),
      "Can only contain letters, spaces, hyphens, apostrophes, commas, and periods"
    )
    .refine((v) => !v || v.length <= maxLen, `Must not exceed ${maxLen} characters`)

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must not exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must contain only letters, numbers, and underscores"
    )
    .transform((v) => v.trim().toLowerCase()),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(/^\S+$/, "Password cannot contain whitespace"),
  first_name: optionalNameString(100),
  middle_name: optionalNameString(100),
  last_name: optionalNameString(100),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || /^[\d\s\-+()]+$/.test(v.trim()),
      "Phone can only contain digits, spaces, hyphens, plus signs, and parentheses"
    )
    .refine(
      (v) => !v?.trim() || v.trim().length <= 20,
      "Phone must not exceed 20 characters"
    ),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Date of birth must be a valid date (YYYY-MM-DD)"
    ),
})

export const updateUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .transform((v) => v.trim().toLowerCase()),
  first_name: optionalNameString(100),
  middle_name: optionalNameString(100),
  last_name: optionalNameString(100),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || /^[\d\s\-+()]+$/.test(v.trim()),
      "Phone can only contain digits, spaces, hyphens, plus signs, and parentheses"
    )
    .refine(
      (v) => !v?.trim() || v.trim().length <= 20,
      "Phone must not exceed 20 characters"
    ),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Date of birth must be a valid date (YYYY-MM-DD)"
    ),
})

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(/^\S+$/, "Password cannot contain whitespace"),
})

export const assignRolesSchema = z.object({
  role_ids: z.array(z.number()),
})

export const grantPermissionsSchema = z.object({
  permission_ids: z
    .array(z.number())
    .min(1, "At least one permission is required"),
  replace: z.boolean().optional(),
})

export const denyPermissionsSchema = z.object({
  permission_ids: z
    .array(z.number())
    .min(1, "At least one permission is required"),
  replace: z.boolean().optional(),
})

export const removePermissionsSchema = z.object({
  permission_ids: z
    .array(z.number())
    .min(1, "At least one permission is required"),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type AssignRolesFormData = z.infer<typeof assignRolesSchema>
export type GrantPermissionsFormData = z.infer<typeof grantPermissionsSchema>
export type DenyPermissionsFormData = z.infer<typeof denyPermissionsSchema>
export type RemovePermissionsFormData = z.infer<typeof removePermissionsSchema>
