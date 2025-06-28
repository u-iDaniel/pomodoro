import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({ req: request });

  // Protected routes
  const protectedPaths = ["/form"];

  if (!token && protectedPaths.includes(path)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Routes that the middleware should not run on
export const config = {
  matcher: [
    "/form/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};