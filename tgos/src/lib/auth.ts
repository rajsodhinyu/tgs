// Phone login: an 8-digit code texted through Linq, then an HMAC-signed
// session cookie. Web Crypto only, so the proxy and route handlers share it.
// Membership lives in the DB (src/lib/members.ts); this file is stateless.
//
// Codes are derived from (phone, 5-minute window) rather than stored: repeat
// requests in a window produce the same code and Linq idempotency key, and
// verify accepts the current or previous window.

export const SESSION_COOKIE = "tgos_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const PENDING_COOKIE = "tgos_pending";
export const PENDING_MAX_AGE = 60 * 30;

const CODE_WINDOW_MS = 5 * 60 * 1000;
export const CODE_DIGITS = 8;

const encoder = new TextEncoder();

function secret(): string {
  return (process.env.TGOS_SESSION_SECRET || "").trim();
}

export function isAuthConfigured(): boolean {
  return secret().length >= 32;
}

// US-first E.164: 10 digits → +1XXXXXXXXXX, 1+10 digits → +1XXXXXXXXXX,
// explicit "+<digits>" kept as-is. Anything else is rejected.
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function formatPhone(phone: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(phone);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : phone;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(message: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(message)));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function codeWindow(now: number = Date.now()): number {
  return Math.floor(now / CODE_WINDOW_MS);
}

async function codeFor(phone: string, window: number): Promise<string> {
  const mac = await sign(`code.${phone}.${window}`);
  const n = new DataView(mac.buffer).getUint32(0) % 10 ** CODE_DIGITS;
  return String(n).padStart(CODE_DIGITS, "0");
}

export async function currentLoginCode(phone: string): Promise<{ code: string; window: number }> {
  const window = codeWindow();
  return { code: await codeFor(phone, window), window };
}

export async function verifyLoginCode(phone: string, raw: unknown): Promise<boolean> {
  if (typeof raw !== "string") return false;
  const code = raw.replace(/\D/g, "");
  if (code.length !== CODE_DIGITS) return false;
  const now = codeWindow();
  const [current, previous] = await Promise.all([codeFor(phone, now), codeFor(phone, now - 1)]);
  // Evaluate both so timing doesn't reveal which window matched.
  const a = timingSafeEqual(code, current);
  const b = timingSafeEqual(code, previous);
  return a || b;
}

type TokenKind = "session" | "pending";

async function createToken(kind: TokenKind, phone: string, maxAge: number): Promise<string> {
  const payload = `${phone}.${Date.now() + maxAge * 1000}`;
  return `${payload}.${toHex(await sign(`${kind}.${payload}`))}`;
}

async function readToken(kind: TokenKind, value: string | undefined): Promise<string | null> {
  if (!value || !isAuthConfigured()) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [phone, exp, sigHex] = parts;
  if (normalizePhone(phone) !== phone) return null;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return null;
  const sig = fromHex(sigHex);
  if (!sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(), sig, encoder.encode(`${kind}.${phone}.${exp}`));
  return ok ? phone : null;
}

export const createSession = (phone: string) => createToken("session", phone, SESSION_MAX_AGE);
// Signature + expiry only; callers that need membership use requireMember().
export const readSession = (value: string | undefined) => readToken("session", value);

// Proof that a non-member number was verified, so it can attach a name to its
// access request.
export const createPendingToken = (phone: string) => createToken("pending", phone, PENDING_MAX_AGE);
export const readPendingToken = (value: string | undefined) => readToken("pending", value);

export function cookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
