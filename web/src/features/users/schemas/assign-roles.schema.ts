import { z } from "zod"

export const assignRolesSchema = z.object({
  role_ids: z.array(z.number()),
})

export type AssignRolesFormData = z.infer<typeof assignRolesSchema>
