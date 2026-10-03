import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth";

// Coarse gate: a validly signed session cookie. Pages and server actions
// re-check membership against the DB with requireMember().
const PUBLIC = [/^\/login$/, /^\/api\/auth\//];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC.some((re) => re.test(pathname))) {
    if (session && pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }
  if (session) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|fonts/|sw\\.js|manifest\\.webmanifest|favicon\\.ico|icon|apple-icon|icon-192\\.png|icon-512\\.png|apple-touch-icon\\.png).*)",
  ],
};
