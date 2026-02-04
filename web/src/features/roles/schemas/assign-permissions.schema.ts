import { z } from "zod"

export const assignPermissionsSchema = z.object({
  permission_ids: z.array(z.number()),
})

export type AssignPermissionsFormData = z.infer<typeof assignPermissionsSchema>
