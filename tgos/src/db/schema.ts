import {
  bigserial,
  boolean,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Lives in its own Postgres schema so it can share the regex.design Neon DB.
export const tgos = pgSchema("tgos");

const at = () => timestamp({ withTimezone: true });

export const members = tgos.table("members", {
  phone: text().primaryKey(),
  name: text().notNull(),
  admin: boolean().notNull().default(false),
  addedAt: at().notNull().defaultNow(),
  addedBy: text(),
});

export const requestStatus = tgos.enum("request_status", ["pending", "approved", "denied"]);

// Verified numbers that aren't members yet.
export const accessRequests = tgos.table("access_requests", {
  phone: text().primaryKey(),
  name: text(),
  status: requestStatus().notNull().default("pending"),
  firstVerifiedAt: at().notNull().defaultNow(),
  lastVerifiedAt: at().notNull().defaultNow(),
  verifyCount: integer().notNull().default(1),
  decidedAt: at(),
  decidedBy: text(),
});

export const codeSends = tgos.table(
  "code_sends",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    phone: text().notNull(),
    ip: text().notNull(),
    member: boolean().notNull(),
    sentAt: at().notNull().defaultNow(),
  },
  (t) => [index("code_sends_sent_at_idx").on(t.sentAt)],
);

export const loginFailures = tgos.table(
  "login_failures",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    phone: text().notNull(),
    failedAt: at().notNull().defaultNow(),
  },
  (t) => [index("login_failures_phone_idx").on(t.phone, t.failedAt)],
);
