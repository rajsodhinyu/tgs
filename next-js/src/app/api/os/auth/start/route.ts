import { NextRequest, NextResponse } from "next/server";
import { currentLoginCode, isAuthConfigured, isTeamPhone, normalizePhone } from "@/lib/tgos-auth";
import { allowCodeSend } from "@/lib/tgos-db";
import { sendLinqText } from "@/lib/linq";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  const team = isTeamPhone(phone);
  let allowed: boolean;
  try {
    allowed = await allowCodeSend(phone, clientIp(request), team);
  } catch (err) {
    console.error("[tgos] code send limit check failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    // Team logins shouldn't depend on the DB; everyone else fails closed.
    allowed = team;
  }
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many codes requested. Try again in a bit." },
      { status: 429 },
    );
  }

  const { code, window } = await currentLoginCode(phone);
  try {
    await sendLinqText(phone, `Your tgos code is ${code}`, `tgos-login:${phone}:${window}`);
  } catch (err) {
    console.error("[tgos] login code send failed", {
      phoneLast4: phone.slice(-4),
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Couldn't send the code. Try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, phone });
}
