import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Shared Neon DB (same one as regex.design); tgos tables are prefixed tgos_.

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function db(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  client ??= neon(url);
  return client;
}

function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const sql = db();
    await sql`
      CREATE TABLE IF NOT EXISTS tgos_code_sends (
        id BIGSERIAL PRIMARY KEY,
        phone TEXT NOT NULL,
        ip TEXT NOT NULL,
        team BOOLEAN NOT NULL,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS tgos_code_sends_sent_at ON tgos_code_sends (sent_at)`;
    await sql`
      CREATE TABLE IF NOT EXISTS tgos_access_requests (
        phone TEXT PRIMARY KEY,
        name TEXT,
        first_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        verify_count INTEGER NOT NULL DEFAULT 1
      )
    `;
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}

const MAX_SENDS_PER_IP_PER_HOUR = 10;
const MAX_SENDS_PER_PHONE_PER_HOUR = 4;
const MAX_NON_TEAM_SENDS_PER_HOUR = 30;

// Records a code send and says whether it's within limits. Limits keep the
// public login form from being used to text arbitrary numbers.
export async function allowCodeSend(phone: string, ip: string, team: boolean): Promise<boolean> {
  await ensureSchema();
  const sql = db();
  const [counts] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE ip = ${ip}) AS by_ip,
      COUNT(*) FILTER (WHERE phone = ${phone}) AS by_phone,
      COUNT(*) FILTER (WHERE NOT team) AS non_team
    FROM tgos_code_sends
    WHERE sent_at > NOW() - INTERVAL '1 hour'
  `;
  const allowed =
    Number(counts.by_ip) < MAX_SENDS_PER_IP_PER_HOUR &&
    Number(counts.by_phone) < MAX_SENDS_PER_PHONE_PER_HOUR &&
    (team || Number(counts.non_team) < MAX_NON_TEAM_SENDS_PER_HOUR);
  if (allowed) {
    await sql`INSERT INTO tgos_code_sends (phone, ip, team) VALUES (${phone}, ${ip}, ${team})`;
  }
  return allowed;
}

export async function recordAccessRequest(phone: string): Promise<void> {
  await ensureSchema();
  await db()`
    INSERT INTO tgos_access_requests (phone) VALUES (${phone})
    ON CONFLICT (phone) DO UPDATE SET
      last_verified_at = NOW(),
      verify_count = tgos_access_requests.verify_count + 1
  `;
}

export async function setAccessRequestName(phone: string, name: string): Promise<void> {
  await ensureSchema();
  await db()`
    INSERT INTO tgos_access_requests (phone, name) VALUES (${phone}, ${name})
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
  `;
}
