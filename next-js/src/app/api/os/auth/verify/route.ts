import { NextRequest, NextResponse } from "next/server";
import {
  TGOS_SESSION_COOKIE,
  clearFailedLogins,
  createSession,
  isAllowedPhone,
  isAuthConfigured,
  isLoginLocked,
  normalizePhone,
  recordFailedLogin,
  sessionCookieOptions,
  verifyLoginCode,
} from "@/lib/tgos-auth";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (phone === null || !isAllowedPhone(phone)) {
    return NextResponse.json({ error: "That code didn't work" }, { status: 401 });
  }
  if (isLoginLocked(phone)) {
    return NextResponse.json(
      { error: "Too many tries. Wait a few minutes and request a new code." },
      { status: 429 },
    );
  }
  if (!(await verifyLoginCode(phone, body?.code))) {
    recordFailedLogin(phone);
    return NextResponse.json({ error: "That code didn't work" }, { status: 401 });
  }
  clearFailedLogins(phone);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TGOS_SESSION_COOKIE, await createSession(phone), sessionCookieOptions());
  return res;
}
