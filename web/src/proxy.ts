import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIES } from "@/shared/constants"

const PROTECTED_PREFIX = "/rbac"
const LOGIN_PATH = "/login"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIES.TOKEN)?.value

  const isProtected = pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`)
  const isLoginPage = pathname === LOGIN_PATH

  if (isProtected && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL(`${PROTECTED_PREFIX}/users`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/rbac", "/rbac/:path*", "/login"],
}
