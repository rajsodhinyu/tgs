import { NextRequest, NextResponse } from "next/server";
import {
  PENDING_COOKIE,
  PENDING_MAX_AGE,
  SESSION_COOKIE,
  cookieOptions,
  createPendingToken,
  createSession,
  isAuthConfigured,
  normalizePhone,
  verifyLoginCode,
} from "@/lib/auth";
import { logError } from "@/lib/http";
import {
  clearFailedLogins,
  getMember,
  isLoginLocked,
  recordAccessRequest,
  recordFailedLogin,
} from "@/lib/members";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (!phone) return NextResponse.json({ error: "That code didn't work" }, { status: 401 });

  try {
    if (await isLoginLocked(phone)) {
      return NextResponse.json(
        { error: "Too many tries. Wait a few minutes and request a new code." },
        { status: 429 },
      );
    }
    if (!(await verifyLoginCode(phone, body?.code))) {
      await recordFailedLogin(phone);
      return NextResponse.json({ error: "That code didn't work" }, { status: 401 });
    }
    await clearFailedLogins(phone);

    const member = await getMember(phone);
    if (member) {
      const res = NextResponse.json({ ok: true, member: true, name: member.name });
      res.cookies.set(SESSION_COOKIE, await createSession(phone), cookieOptions());
      res.cookies.set(PENDING_COOKIE, "", cookieOptions(0));
      return res;
    }

    await recordAccessRequest(phone);
    const res = NextResponse.json({ ok: true, member: false });
    res.cookies.set(PENDING_COOKIE, await createPendingToken(phone), cookieOptions(PENDING_MAX_AGE));
    return res;
  } catch (err) {
    logError("verify failed", err, { phoneLast4: phone.slice(-4) });
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 503 });
  }
}
