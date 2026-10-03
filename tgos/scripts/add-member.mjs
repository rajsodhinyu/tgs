// Bootstrap helper: pnpm member:add "Name" "+1 555 010 0001" [admin]
import { neon } from "@neondatabase/serverless";

const [name, rawPhone, flag] = process.argv.slice(2);
const admin = flag === "admin";
const digits = (rawPhone || "").replace(/\D/g, "");
const phone =
  digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith("1") ? `+${digits}` : null;
if (!name || !phone) {
  console.error('Usage: pnpm member:add "Name" "+1 555 010 0001" [admin]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
await sql`
  INSERT INTO tgos.members (phone, name, admin, added_by) VALUES (${phone}, ${name}, ${admin}, 'script')
  ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, admin = EXCLUDED.admin
`;
await sql`UPDATE tgos.access_requests SET status = 'approved', decided_at = NOW(), decided_by = 'script' WHERE phone = ${phone}`;
console.log(`Added ${name} (…${phone.slice(-4)})${admin ? " as admin" : ""}`);
