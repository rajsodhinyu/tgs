import Link from "next/link";
import { pendingRequestCount, requireMember } from "@/lib/members";
import HomeScreenHint from "./HomeScreenHint";

const TOOLS = [
  {
    href: "/playlists/export",
    name: "Playlist export",
    description: "Crate, smoke break, and artist card images from a playlist.",
  },
];

const card = "block rounded-2xl bg-white/10 p-5 transition-colors active:bg-white/25 hover:bg-white/20";

export default async function Page() {
  const member = await requireMember();
  const pending = member.admin ? await pendingRequestCount() : 0;
  return (
    <div className="mx-auto max-w-2xl pt-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-title text-4xl uppercase">Hi, {member.name}!</h1>
        <form action="/api/auth/logout" method="post">
          <button className="rounded-full bg-white/10 px-4 py-1.5 font-title text-sm uppercase hover:bg-white/20">
            log out
          </button>
        </form>
      </div>
      <ul className="mt-8 grid gap-3">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className={card}>
              <div className="font-title text-xl uppercase">{tool.name}</div>
              <div className="mt-1 font-roc text-sm text-white/70">{tool.description}</div>
            </Link>
          </li>
        ))}
        {member.admin && (
          <li>
            <Link href="/team" className={card}>
              <div className="flex items-center gap-2 font-title text-xl uppercase">
                Team
                {pending > 0 && (
                  <span className="rounded-full bg-tgs-pink px-2 py-0.5 font-roc text-xs font-medium text-black">
                    {pending} waiting
                  </span>
                )}
              </div>
              <div className="mt-1 font-roc text-sm text-white/70">Who&apos;s in, and who&apos;s asking.</div>
            </Link>
          </li>
        )}
      </ul>
      <HomeScreenHint />
    </div>
  );
}
