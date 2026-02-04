import { z } from "zod"

export const grantPermissionsSchema = z.object({
  permission_ids: z.array(z.number()).min(1, "At least one permission is required"),
  replace: z.boolean().optional(),
})

export const denyPermissionsSchema = z.object({
  permission_ids: z.array(z.number()).min(1, "At least one permission is required"),
  replace: z.boolean().optional(),
})

export const removePermissionsSchema = z.object({
  permission_ids: z.array(z.number()).min(1, "At least one permission is required"),
})

export type GrantPermissionsFormData = z.infer<typeof grantPermissionsSchema>
export type DenyPermissionsFormData = z.infer<typeof denyPermissionsSchema>
export type RemovePermissionsFormData = z.infer<typeof removePermissionsSchema>
