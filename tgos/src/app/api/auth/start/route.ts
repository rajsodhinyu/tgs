import { NextRequest, NextResponse } from "next/server";
import { currentLoginCode, isAuthConfigured, normalizePhone } from "@/lib/auth";
import { clientIp, logError } from "@/lib/http";
import { sendLinqText } from "@/lib/linq";
import { allowCodeSend, getMember } from "@/lib/members";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });

  try {
    const member = (await getMember(phone)) !== null;
    if (!(await allowCodeSend(phone, clientIp(request), member))) {
      return NextResponse.json({ error: "Too many codes requested. Try again in a bit." }, { status: 429 });
    }
  } catch (err) {
    logError("code send check failed", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 503 });
  }

  const { code, window } = await currentLoginCode(phone);
  try {
    await sendLinqText(phone, `Your tgos code is ${code}`, `tgos-login:${phone}:${window}`);
  } catch (err) {
    logError("login code send failed", err, { phoneLast4: phone.slice(-4) });
    return NextResponse.json({ error: "Couldn't send the code. Try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, phone });
}
