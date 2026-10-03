import type { Metadata } from "next";
import { formatPhone } from "@/lib/auth";
import { listMembers, listPendingRequests, requireAdmin } from "@/lib/members";
import BackLink from "../BackLink";
import AddMemberForm from "./AddMemberForm";
import { approve, deny, remove } from "./actions";

export const metadata: Metadata = { title: "Team · tgos" };

const row = "flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3";
const pill = "rounded-full px-3 py-1.5 font-title text-xs uppercase transition-colors";

const ago = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function since(date: Date): string {
  const minutes = Math.round((date.getTime() - Date.now()) / 60000);
  if (minutes > -60) return ago.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return ago.format(hours, "hour");
  return ago.format(Math.round(hours / 24), "day");
}

export default async function Page() {
  const me = await requireAdmin();
  const [members, pending] = await Promise.all([listMembers(), listPendingRequests()]);
  return (
    <div className="mx-auto max-w-2xl pt-6">
      <div className="flex items-center gap-3">
        <BackLink />
        <h1 className="font-title text-3xl uppercase">Team</h1>
      </div>

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="font-title text-lg uppercase text-white/80">Asking to join</h2>
          <ul className="mt-3 grid gap-2">
            {pending.map((r) => (
              <li key={r.phone} className={row}>
                <div className="min-w-0">
                  <div className="truncate font-roc text-base font-medium">{r.name || "No name yet"}</div>
                  <div className="font-roc text-xs text-white/60">
                    {formatPhone(r.phone)} · verified {since(r.lastVerifiedAt)}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {r.name ? (
                    <form action={approve}>
                      <input type="hidden" name="phone" value={r.phone} />
                      <button className={`${pill} bg-white text-black`}>let in</button>
                    </form>
                  ) : (
                    <form action={approve} className="flex gap-2">
                      <input type="hidden" name="phone" value={r.phone} />
                      <input
                        name="name"
                        placeholder="Name"
                        required
                        maxLength={80}
                        className="w-24 rounded-full bg-white/10 px-3 py-1 font-roc text-sm outline-none focus:bg-white/20"
                      />
                      <button className={`${pill} bg-white text-black`}>let in</button>
                    </form>
                  )}
                  <form action={deny}>
                    <input type="hidden" name="phone" value={r.phone} />
                    <button className={`${pill} bg-white/10 hover:bg-white/20`}>no</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-title text-lg uppercase text-white/80">In</h2>
        <ul className="mt-3 grid gap-2">
          {members.map((m) => (
            <li key={m.phone} className={row}>
              <div className="min-w-0">
                <div className="truncate font-roc text-base font-medium">{m.name}</div>
                <div className="font-roc text-xs text-white/60">{formatPhone(m.phone)}</div>
              </div>
              {m.phone === me.phone ? (
                <span className="font-roc text-xs text-white/50">you</span>
              ) : (
                <form action={remove}>
                  <input type="hidden" name="phone" value={m.phone} />
                  <button className={`${pill} bg-white/10 hover:bg-white/20`}>remove</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-title text-lg uppercase text-white/80">Add someone</h2>
        <div className="mt-3">
          <AddMemberForm />
        </div>
      </section>
    </div>
  );
}
