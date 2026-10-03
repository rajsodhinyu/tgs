"use server";

import { revalidatePath } from "next/cache";
import { normalizePhone } from "@/lib/auth";
import { logError } from "@/lib/http";
import { sendLinqText } from "@/lib/linq";
import { addMember, denyRequest, pendingRequest, removeMember, requireAdmin } from "@/lib/members";

export type ActionResult = { error?: string } | undefined;

async function welcome(phone: string, name: string) {
  try {
    await sendLinqText(phone, `You're in, ${name}! You can log in to tgos with this number.`, `tgos-welcome:${phone}`);
  } catch (err) {
    logError("welcome text failed", err, { phoneLast4: phone.slice(-4) });
  }
}

export async function approve(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const phone = normalizePhone(formData.get("phone"));
  const request = phone ? await pendingRequest(phone) : null;
  if (!request) return;
  const name = String(formData.get("name") || request.name || "").trim().slice(0, 80);
  if (!name) return;
  await addMember(request.phone, name, me);
  await welcome(request.phone, name);
  revalidatePath("/team");
}

export async function deny(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const phone = normalizePhone(formData.get("phone"));
  if (!phone) return;
  await denyRequest(phone, me);
  revalidatePath("/team");
}

export async function add(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const phone = normalizePhone(formData.get("phone"));
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  if (!name) return { error: "Add a name" };
  if (!phone) return { error: "That phone number doesn't look right" };
  await addMember(phone, name, me);
  revalidatePath("/team");
  return {};
}

export async function remove(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const phone = normalizePhone(formData.get("phone"));
  if (!phone || phone === me.phone) return;
  await removeMember(phone);
  revalidatePath("/team");
}
