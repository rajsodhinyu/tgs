import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { accessRequests, codeSends, loginFailures, members } from "@/db/schema";
import { SESSION_COOKIE, readSession } from "./auth";

export type Member = { phone: string; name: string; admin: boolean };

export async function getMember(phone: string): Promise<Member | null> {
  const [row] = await db()
    .select({ phone: members.phone, name: members.name, admin: members.admin })
    .from(members)
    .where(eq(members.phone, phone));
  return row ?? null;
}

// The signed-in member for this request, re-checked against the DB so removing
// someone logs them out everywhere. Memoized per request.
export const currentMember = cache(async (): Promise<Member | null> => {
  const phone = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  return phone ? getMember(phone) : null;
});

export async function requireMember(): Promise<Member> {
  const member = await currentMember();
  if (!member) redirect("/login");
  return member;
}

// Team management is admin-only; everyone else gets a 404.
export async function requireAdmin(): Promise<Member> {
  const member = await requireMember();
  if (!member.admin) notFound();
  return member;
}

const MAX_SENDS_PER_IP_PER_HOUR = 10;
const MAX_SENDS_PER_PHONE_PER_HOUR = 4;
const MAX_NON_MEMBER_SENDS_PER_HOUR = 30;

// Records a code send and says whether it's within limits, so the public login
// form can't be used to text arbitrary numbers.
export async function allowCodeSend(phone: string, ip: string, member: boolean): Promise<boolean> {
  const [counts] = await db()
    .select({
      byIp: sql<number>`count(*) filter (where ${codeSends.ip} = ${ip})`.mapWith(Number),
      byPhone: sql<number>`count(*) filter (where ${codeSends.phone} = ${phone})`.mapWith(Number),
      nonMember: sql<number>`count(*) filter (where not ${codeSends.member})`.mapWith(Number),
    })
    .from(codeSends)
    .where(gt(codeSends.sentAt, sql`now() - interval '1 hour'`));
  const allowed =
    counts.byIp < MAX_SENDS_PER_IP_PER_HOUR &&
    counts.byPhone < MAX_SENDS_PER_PHONE_PER_HOUR &&
    (member || counts.nonMember < MAX_NON_MEMBER_SENDS_PER_HOUR);
  if (allowed) await db().insert(codeSends).values({ phone, ip, member });
  return allowed;
}

// Codes are only accepted for a number we actually texted within the last two
// code windows, so codes can't be tried against numbers that never asked.
export async function hasRecentCodeSend(phone: string): Promise<boolean> {
  const [row] = await db()
    .select({ n: count() })
    .from(codeSends)
    .where(and(eq(codeSends.phone, phone), gt(codeSends.sentAt, sql`now() - interval '10 minutes'`)));
  return row.n > 0;
}

const MAX_FAILED_LOGINS = 5;
const recentFailure = (phone: string) =>
  and(eq(loginFailures.phone, phone), gt(loginFailures.failedAt, sql`now() - interval '10 minutes'`));

export async function isLoginLocked(phone: string): Promise<boolean> {
  const [row] = await db().select({ n: count() }).from(loginFailures).where(recentFailure(phone));
  return row.n >= MAX_FAILED_LOGINS;
}

export async function recordFailedLogin(phone: string): Promise<void> {
  await db().insert(loginFailures).values({ phone });
}

export async function clearFailedLogins(phone: string): Promise<void> {
  await db().delete(loginFailures).where(eq(loginFailures.phone, phone));
}

export async function recordAccessRequest(phone: string): Promise<void> {
  await db()
    .insert(accessRequests)
    .values({ phone })
    .onConflictDoUpdate({
      target: accessRequests.phone,
      set: { lastVerifiedAt: sql`now()`, verifyCount: sql`${accessRequests.verifyCount} + 1` },
    });
}

export async function setAccessRequestName(phone: string, name: string): Promise<void> {
  await db()
    .insert(accessRequests)
    .values({ phone, name })
    .onConflictDoUpdate({ target: accessRequests.phone, set: { name } });
}

export function listMembers() {
  return db()
    .select({ phone: members.phone, name: members.name, admin: members.admin, addedAt: members.addedAt })
    .from(members)
    .orderBy(asc(members.addedAt));
}

export function listPendingRequests() {
  return db()
    .select({
      phone: accessRequests.phone,
      name: accessRequests.name,
      lastVerifiedAt: accessRequests.lastVerifiedAt,
      verifyCount: accessRequests.verifyCount,
    })
    .from(accessRequests)
    .where(eq(accessRequests.status, "pending"))
    .orderBy(desc(accessRequests.lastVerifiedAt));
}

export async function pendingRequestCount(): Promise<number> {
  const [row] = await db()
    .select({ n: count() })
    .from(accessRequests)
    .where(eq(accessRequests.status, "pending"));
  return row.n;
}

export async function addMember(phone: string, name: string, by: Member): Promise<void> {
  await db()
    .insert(members)
    .values({ phone, name, addedBy: by.name })
    .onConflictDoUpdate({ target: members.phone, set: { name } });
  await db()
    .update(accessRequests)
    .set({ status: "approved", decidedAt: sql`now()`, decidedBy: by.name })
    .where(eq(accessRequests.phone, phone));
}

export async function denyRequest(phone: string, by: Member): Promise<void> {
  await db()
    .update(accessRequests)
    .set({ status: "denied", decidedAt: sql`now()`, decidedBy: by.name })
    .where(eq(accessRequests.phone, phone));
}

// Also drops their old approved request so a later verify shows up as pending again.
export async function removeMember(phone: string): Promise<void> {
  await db().delete(members).where(eq(members.phone, phone));
  await db().delete(accessRequests).where(eq(accessRequests.phone, phone));
}

export async function pendingRequest(phone: string) {
  const [row] = await db()
    .select({ phone: accessRequests.phone, name: accessRequests.name })
    .from(accessRequests)
    .where(and(eq(accessRequests.phone, phone), eq(accessRequests.status, "pending")));
  return row ?? null;
}
