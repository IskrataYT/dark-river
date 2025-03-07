import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  const { pathname } = request.nextUrl

  // Allow access to auth routes if no session
  if (!session && pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Require session for all other routes
  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  try {
    const payload = await verifyToken(session)

    // Check ban status through API route
    const response = await fetch(`${request.nextUrl.origin}/api/auth/check-ban-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session }),
    })

    if (!response.ok) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    const { isBanned } = await response.json()

    // Check for banned status FIRST
    if (isBanned) {
      // Only allow banned users to access /banned and /contact
      if (pathname === "/banned" || pathname === "/contact") {
        return NextResponse.next()
      }
      // Redirect banned users to /banned from ANY other route
      return NextResponse.redirect(new URL("/banned", request.url))
    }

    // Non-banned users should not access the banned page
    if (pathname === "/banned") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Handle auth routes for logged in users
    if (pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // Invalid session
    return NextResponse.redirect(new URL("/auth", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}

