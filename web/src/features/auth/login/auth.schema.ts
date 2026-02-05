import { z } from "zod"

/** Aligned with server LoginDto */
export const loginSchema = z.object({
  username_or_email: z
    .string()
    .min(1, "Username or email is required")
    .min(3, "Username or email must be at least 3 characters")
    .max(100, "Username or email must not exceed 100 characters")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(/^\S+$/, "Password cannot contain whitespace"),
})

export type LoginFormData = z.infer<typeof loginSchema>
