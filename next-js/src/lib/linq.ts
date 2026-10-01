import "server-only";

// Minimal Linq (iMessage/SMS) sender. POST /v3/chats reuses the existing 1:1
// chat for the same from/to pair, so it works for first and repeat texts.
// The first message of a new chat may not contain a URL.

const LINQ_CHATS_URL = "https://api.linqapp.com/api/partner/v3/chats";

export async function sendLinqText(
  to: string,
  text: string,
  idempotencyKey: string,
): Promise<void> {
  const apiKey = (process.env.LINQ_API_KEY || "").trim();
  const from = (process.env.LINQ_FROM_NUMBER || "").trim();
  if (!apiKey || !from) throw new Error("Missing LINQ_API_KEY or LINQ_FROM_NUMBER");

  const res = await fetch(LINQ_CHATS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      message: {
        parts: [{ type: "text", value: text }],
        idempotency_key: idempotencyKey.slice(0, 255),
      },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Linq send failed: ${res.status} ${body.slice(0, 200)}`);
  }
}
