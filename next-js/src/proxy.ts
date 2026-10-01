import { NextRequest, NextResponse } from "next/server";
import { TGOS_SESSION_COOKIE, readSession } from "@/lib/tgos-auth";

// tgos.app is the internal team app. Its pages live under /os in this app;
// on tgos hosts every non-API, non-asset path is rewritten into /os (the URL
// bar keeps tgos.app/...) and gated behind a team session. /os is not served
// on any other host. Locally, use http://tgos.localhost:3000.
export const config = {
  matcher: [
    "/api/:path*",
    "/os/:path*",
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      has: [{ type: "host", value: "(www\\.)?tgos\\.(app|localhost)" }],
    },
  ],
};

const TGOS_HOSTS = new Set(["tgos.app", "www.tgos.app", "tgos.localhost"]);

const PUBLIC_PAGES = new Set(["/os/login"]);
const PUBLIC_API_PREFIX = "/api/os/auth/";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Public /api routes are open to cross-origin GETs (embeds, other sites).
// tgos /api/os routes are same-origin only.
function publicApi(req: NextRequest): NextResponse {
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(CORS_HEADERS)) response.headers.set(key, value);
  return response;
}

function inSection(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase().replace(/:\d+$/, "");

  if (!TGOS_HOSTS.has(host)) {
    if (inSection(pathname, "/os") || inSection(pathname, "/api/os")) {
      return new NextResponse(null, { status: 404 });
    }
    return pathname.startsWith("/api/") ? publicApi(req) : NextResponse.next();
  }

  const session = await readSession(req.cookies.get(TGOS_SESSION_COOKIE)?.value);

  if (inSection(pathname, "/api/os")) {
    if (!pathname.startsWith(PUBLIC_API_PREFIX) && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) return publicApi(req);

  // Static files from public/ (fonts, images) pass straight through.
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();

  const effective = inSection(pathname, "/os")
    ? pathname
    : pathname === "/"
      ? "/os"
      : `/os${pathname}`;
  const visible = effective === "/os" ? "/" : effective.slice(3);

  if (PUBLIC_PAGES.has(effective)) {
    if (session) return NextResponse.redirect(new URL("/", req.url));
  } else if (!session) {
    const login = new URL("/login", req.url);
    if (visible !== "/") login.searchParams.set("next", visible + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.rewrite(new URL(effective + search, req.url));
}
