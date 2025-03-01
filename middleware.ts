import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  const { pathname } = request.nextUrl

  // Handle loading page - prevent access if not coming from auth flow
  if (pathname === "/loading") {
    const referer = request.headers.get("referer") || ""
    const isFromAuth = referer.includes("/auth")

    if (!isFromAuth && session) {
      // If not coming from auth and already logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Handle authentication routes
  if (pathname.startsWith("/auth")) {
    if (session) {
      try {
        await verifyToken(session)
        // If session is valid, redirect to home
        return NextResponse.redirect(new URL("/", request.url))
      } catch {
        // If session is invalid, continue to auth page
        return NextResponse.next()
      }
    }
    // No session, continue to auth page
    return NextResponse.next()
  }

  // Handle protected routes
  if (!session) {
    // No session, redirect to auth
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  try {
    await verifyToken(session)
    return NextResponse.next()
  } catch {
    // Invalid session, redirect to auth
    return NextResponse.redirect(new URL("/auth", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

