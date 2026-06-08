import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Injects the current pathname as a request header so the root layout
 * can read it (Server Components can't access the URL directly).
 * Used to suppress the nav/hero on the /select profile picker page.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
