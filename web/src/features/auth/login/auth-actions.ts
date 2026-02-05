"use server"

import { cookies } from "next/headers"
import { AUTH_COOKIES } from "@/shared/constants"
import type { User } from "./auth.types"

const COOKIE_MAX_AGE_DAYS = 7
const MAX_AGE_SECONDS = 60 * 60 * 24 * COOKIE_MAX_AGE_DAYS

export async function setAuthCookies(token: string, user: User): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIES.TOKEN, token, {
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  cookieStore.set(AUTH_COOKIES.USER, JSON.stringify(user), {
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function deleteAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIES.TOKEN)
  cookieStore.delete(AUTH_COOKIES.USER)
}
