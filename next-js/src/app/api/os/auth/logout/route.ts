import { NextRequest, NextResponse } from "next/server";
import { TGOS_SESSION_COOKIE, sessionCookieOptions } from "@/lib/tgos-auth";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url), 303);
  res.cookies.set(TGOS_SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
