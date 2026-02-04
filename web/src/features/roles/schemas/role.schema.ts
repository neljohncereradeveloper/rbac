import { z } from "zod"

/** Aligned with server CreateRoleDto/UpdateRoleDto RequiredStringValidation */
const roleNamePattern = /^[a-zA-Z0-9\s\-_&.,()!?]+$/

/** Aligned with server CreateRoleDto/UpdateRoleDto OptionalStringValidation */
const optionalDescription = () =>
  z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || roleNamePattern.test(v.trim()),
      "Description can only contain letters, numbers, spaces, and basic punctuation"
    )
    .refine((v) => !v || v.length <= 500, "Description must not exceed 500 characters")

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .regex(
      roleNamePattern,
      "Name can only contain letters, numbers, spaces, and basic punctuation"
    )
    .transform((v) => v.trim()),
  description: optionalDescription(),
})

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .regex(
      roleNamePattern,
      "Name can only contain letters, numbers, spaces, and basic punctuation"
    )
    .transform((v) => v.trim()),
  description: optionalDescription(),
})

export type CreateRoleFormData = z.infer<typeof createRoleSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>
