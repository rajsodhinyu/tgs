"use client";

import { useActionState, useRef } from "react";
import { add, type ActionResult } from "./actions";

const input =
  "w-full rounded-full bg-white/10 px-4 py-2.5 font-roc text-base text-white placeholder:text-white/40 outline-none focus:bg-white/20";

export default function AddMemberForm() {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult, FormData>(async (prev, data) => {
    const result = await add(prev, data);
    if (!result?.error) form.current?.reset();
    return result;
  }, undefined);
  return (
    <form ref={form} action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
      <input className={input} name="name" placeholder="Name" autoComplete="off" maxLength={80} required />
      <input className={input} name="phone" type="tel" inputMode="tel" placeholder="Phone number" autoComplete="off" required />
      <button
        className="rounded-full bg-white px-5 py-2.5 font-title uppercase text-black disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "adding…" : "add"}
      </button>
      {state?.error && <p className="font-roc text-sm text-red-200 sm:col-span-3">{state.error}</p>}
    </form>
  );
}
