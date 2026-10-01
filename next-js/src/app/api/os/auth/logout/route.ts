import { NextResponse } from "next/server";
import { TGOS_SESSION_COOKIE, sessionCookieOptions } from "@/lib/tgos-auth";

export async function POST() {
  const res = new NextResponse(null, {
    status: 303,
    headers: { Location: "/login" },
  });
  res.cookies.set(TGOS_SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
