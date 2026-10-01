import { NextRequest, NextResponse } from "next/server";
import {
  currentLoginCode,
  isAllowedPhone,
  isAuthConfigured,
  normalizePhone,
} from "@/lib/tgos-auth";
import { sendLinqText } from "@/lib/linq";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  // Same response whether or not the number is on the list, so the endpoint
  // can't be used to probe who's on the team.
  if (isAllowedPhone(phone)) {
    const { code, window } = await currentLoginCode(phone);
    try {
      await sendLinqText(
        phone,
        `Your TGOS login code is ${code}`,
        `tgos-login:${phone}:${window}`,
      );
    } catch (err) {
      console.error("[tgos] login code send failed", {
        phoneLast4: phone.slice(-4),
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json({ error: "Couldn't send the code. Try again." }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true, phone });
}
