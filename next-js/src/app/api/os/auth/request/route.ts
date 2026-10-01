import { NextRequest, NextResponse } from "next/server";
import { TGOS_PENDING_COOKIE, readPendingToken } from "@/lib/tgos-auth";
import { setAccessRequestName } from "@/lib/tgos-db";

// Attaches a name to a verified non-team number's access request.
export async function POST(request: NextRequest) {
  const phone = await readPendingToken(request.cookies.get(TGOS_PENDING_COOKIE)?.value);
  if (!phone) {
    return NextResponse.json({ error: "Verify your number again" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  try {
    await setAccessRequestName(phone, name);
  } catch (err) {
    console.error("[tgos] access request name save failed", {
      phoneLast4: phone.slice(-4),
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
