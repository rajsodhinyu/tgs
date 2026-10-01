"use client";

import { useState } from "react";

type Step =
  | { kind: "phone" }
  | { kind: "code"; phone: string }
  | { kind: "pending" }
  | { kind: "requested"; name: string };

const inputClass =
  "w-full rounded-full bg-white/10 px-5 py-3 font-roc text-lg text-white placeholder:text-white/40 outline-none focus:bg-white/20";
const buttonClass =
  "w-full rounded-full bg-white px-5 py-3 font-title uppercase text-black disabled:opacity-50";

export default function LoginForm({ next }: { next: string }) {
  const [step, setStep] = useState<Step>({ kind: "phone" });
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string, body: object) {
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data };
    } catch {
      return { ok: false, data: { error: "Couldn't reach the server. Try again." } };
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/os/auth/start", { phone });
    setBusy(false);
    if (!ok) return setError(data.error || "Something went wrong");
    setCode("");
    setStep({ kind: "code", phone: data.phone });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (step.kind !== "code") return;
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/os/auth/verify", { phone: step.phone, code });
    if (!ok) {
      setBusy(false);
      return setError(data.error || "Something went wrong");
    }
    if (data.member) return window.location.assign(next);
    setBusy(false);
    setStep({ kind: "pending" });
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/os/auth/request", { name });
    setBusy(false);
    if (!ok) return setError(data.error || "Something went wrong");
    setStep({ kind: "requested", name: name.trim() });
  }

  if (step.kind === "requested") {
    return (
      <p className="mt-8 font-roc text-lg text-white/80">
        Thanks, {step.name}. We&apos;ll let you know if you get access.
      </p>
    );
  }

  if (step.kind === "pending") {
    return (
      <form onSubmit={saveName} className="mt-8 grid gap-3">
        <p className="font-roc text-sm text-white/70">
          Your number checks out, but it isn&apos;t on the team list yet. Tell us who you are.
        </p>
        <input
          className={inputClass}
          type="text"
          autoComplete="name"
          placeholder="Your name"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
        <button className={buttonClass} disabled={busy || !name.trim()}>
          {busy ? "saving…" : "send"}
        </button>
        {error && <p className="font-roc text-sm text-red-300">{error}</p>}
      </form>
    );
  }

  if (step.kind === "phone") {
    return (
      <form onSubmit={sendCode} className="mt-8 grid gap-3">
        <input
          className={inputClass}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoFocus
          required
        />
        <button className={buttonClass} disabled={busy || !phone.trim()}>
          {busy ? "sending…" : "text me a code"}
        </button>
        {error && <p className="font-roc text-sm text-red-300">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="mt-8 grid gap-3">
      <p className="font-roc text-sm text-white/70">
        We texted a code to {step.phone}.
      </p>
      <input
        className={`${inputClass} tracking-[0.3em]`}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={8}
        placeholder="8-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        autoFocus
        required
      />
      <button className={buttonClass} disabled={busy || code.length !== 8}>
        {busy ? "checking…" : "log in"}
      </button>
      {error && <p className="font-roc text-sm text-red-300">{error}</p>}
      <button
        type="button"
        className="font-roc text-sm text-white/60 underline"
        onClick={() => {
          setError(null);
          setStep({ kind: "phone" });
        }}
      >
        use a different number
      </button>
    </form>
  );
}
