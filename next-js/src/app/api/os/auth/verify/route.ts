import { NextRequest, NextResponse } from "next/server";
import {
  TGOS_SESSION_COOKIE,
  createSession,
  isAllowedPhone,
  isAuthConfigured,
  normalizePhone,
  sessionCookieOptions,
  verifyLoginCode,
} from "@/lib/tgos-auth";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  const valid =
    phone !== null && isAllowedPhone(phone) && (await verifyLoginCode(phone, body?.code));
  if (!valid) {
    return NextResponse.json({ error: "That code didn't work" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TGOS_SESSION_COOKIE, await createSession(phone), sessionCookieOptions());
  return res;
}
