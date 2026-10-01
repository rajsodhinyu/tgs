// tgos.app auth: a team list of names + phone numbers (TGOS_TEAM), a login code
// texted through Linq, and an HMAC-signed session cookie. Stateless (no DB) and
// Web Crypto only, so the proxy and route handlers share it. Anyone can verify a
// number; only team numbers get a session (others get a short "pending" token).
//
// Login codes are derived from (phone, 5-minute window) rather than stored:
// repeat requests in a window produce the same code + Linq idempotency key, so
// a number can't be spammed with texts, and verify accepts the current or
// previous window.

export const TGOS_SESSION_COOKIE = "tgos_session";
export const TGOS_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds
export const TGOS_PENDING_COOKIE = "tgos_pending";
export const TGOS_PENDING_MAX_AGE = 60 * 30;

const CODE_WINDOW_MS = 5 * 60 * 1000;
const CODE_DIGITS = 8;

const encoder = new TextEncoder();

function secret(): string {
  return (process.env.TGOS_SESSION_SECRET || "").trim();
}

// US-first E.164: 10 digits → +1XXXXXXXXXX, 1+10 digits → +1XXXXXXXXXX,
// explicit "+<digits>" kept as-is. Anything else is rejected.
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

// TGOS_TEAM="Raj:+1 916 500 9487, Annabelle:(805) 850-8160, ..." → phone → name.
export function team(): Map<string, string> {
  const out = new Map<string, string>();
  for (const entry of (process.env.TGOS_TEAM || "").split(",")) {
    const i = entry.indexOf(":");
    const phone = normalizePhone(i === -1 ? entry : entry.slice(i + 1));
    if (phone) out.set(phone, i === -1 ? "" : entry.slice(0, i).trim());
  }
  return out;
}

export function isTeamPhone(phone: string): boolean {
  return team().has(phone);
}

export function teamName(phone: string): string {
  return team().get(phone) || "";
}

async function hmacKey(key: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(message: string): Promise<Uint8Array> {
  const key = await hmacKey(secret());
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
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

export function isAuthConfigured(): boolean {
  return secret().length >= 32;
}

function codeWindow(now: number = Date.now()): number {
  return Math.floor(now / CODE_WINDOW_MS);
}

async function codeFor(phone: string, window: number): Promise<string> {
  const mac = await sign(`code.${phone}.${window}`);
  const n = new DataView(mac.buffer).getUint32(0) % 10 ** CODE_DIGITS;
  return String(n).padStart(CODE_DIGITS, "0");
}

export async function currentLoginCode(
  phone: string,
): Promise<{ code: string; window: number }> {
  const window = codeWindow();
  return { code: await codeFor(phone, window), window };
}

export async function verifyLoginCode(phone: string, raw: unknown): Promise<boolean> {
  if (typeof raw !== "string") return false;
  const code = raw.replace(/\D/g, "");
  if (code.length !== CODE_DIGITS) return false;
  const now = codeWindow();
  const [current, previous] = await Promise.all([
    codeFor(phone, now),
    codeFor(phone, now - 1),
  ]);
  // Evaluate both so timing doesn't reveal which window matched.
  const a = timingSafeEqual(code, current);
  const b = timingSafeEqual(code, previous);
  return a || b;
}

const MAX_FAILED_LOGINS = 5;
// Best-effort and per server instance; codes are 8 digits and expire in 5-10 min.
const failedLogins = new Map<string, { window: number; count: number }>();

function failedLoginCount(phone: string): number {
  const entry = failedLogins.get(phone);
  if (!entry) return 0;
  if (entry.window < codeWindow() - 1) {
    failedLogins.delete(phone);
    return 0;
  }
  return entry.count;
}

export function isLoginLocked(phone: string): boolean {
  return failedLoginCount(phone) >= MAX_FAILED_LOGINS;
}

export function recordFailedLogin(phone: string): void {
  if (failedLogins.size > 10_000) {
    for (const key of [...failedLogins.keys()]) failedLoginCount(key);
  }
  const count = failedLoginCount(phone);
  const window = failedLogins.get(phone)?.window ?? codeWindow();
  failedLogins.set(phone, { window, count: count + 1 });
}

export function clearFailedLogins(phone: string): void {
  failedLogins.delete(phone);
}

type TokenKind = "session" | "pending";

async function createToken(kind: TokenKind, phone: string, maxAge: number): Promise<string> {
  const exp = String(Date.now() + maxAge * 1000);
  const payload = `${phone}.${exp}`;
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
  const key = await hmacKey(secret());
  const ok = await crypto.subtle.verify("HMAC", key, sig, encoder.encode(`${kind}.${phone}.${exp}`));
  return ok ? phone : null;
}

export function createSession(phone: string): Promise<string> {
  return createToken("session", phone, TGOS_SESSION_MAX_AGE);
}

// Returns the phone if the cookie is validly signed, unexpired, and the phone
// is still on the team list (removing a number revokes its sessions).
export async function readSession(value: string | undefined): Promise<string | null> {
  const phone = await readToken("session", value);
  return phone && isTeamPhone(phone) ? phone : null;
}

// Proof that a non-team number was verified, so it can attach a name to its
// access request.
export function createPendingToken(phone: string): Promise<string> {
  return createToken("pending", phone, TGOS_PENDING_MAX_AGE);
}

export function readPendingToken(value: string | undefined): Promise<string | null> {
  return readToken("pending", value);
}

export function sessionCookieOptions(maxAge: number = TGOS_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
