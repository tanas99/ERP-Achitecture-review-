import { auth } from "@/server/auth/config";
import { NextResponse } from "next/server";

/**
 * Route protection (ARCHITECTURE.md §5/§6). Protects the (app) area; the
 * application layer remains the authoritative permission check. Unauthenticated
 * users are redirected to sign-in.
 */
export default auth((req) => {
  const isAuthed = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  const isPublic = pathname.startsWith("/sign-in") || pathname.startsWith("/api/auth");
  if (isPublic) return NextResponse.next();

  if (!isAuthed) {
    const url = new URL("/sign-in", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
