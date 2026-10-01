import { NextRequest, NextResponse } from "next/server";
import {
  TGOS_PENDING_COOKIE,
  TGOS_PENDING_MAX_AGE,
  TGOS_SESSION_COOKIE,
  clearFailedLogins,
  createPendingToken,
  createSession,
  isAuthConfigured,
  isLoginLocked,
  isTeamPhone,
  normalizePhone,
  recordFailedLogin,
  sessionCookieOptions,
  teamName,
  verifyLoginCode,
} from "@/lib/tgos-auth";
import { recordAccessRequest } from "@/lib/tgos-db";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (phone === null) {
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

  if (isTeamPhone(phone)) {
    const res = NextResponse.json({ ok: true, member: true, name: teamName(phone) });
    res.cookies.set(TGOS_SESSION_COOKIE, await createSession(phone), sessionCookieOptions());
    res.cookies.set(TGOS_PENDING_COOKIE, "", sessionCookieOptions(0));
    return res;
  }

  try {
    await recordAccessRequest(phone);
  } catch (err) {
    console.error("[tgos] access request save failed", {
      phoneLast4: phone.slice(-4),
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true, member: false });
  res.cookies.set(
    TGOS_PENDING_COOKIE,
    await createPendingToken(phone),
    sessionCookieOptions(TGOS_PENDING_MAX_AGE),
  );
  return res;
}
