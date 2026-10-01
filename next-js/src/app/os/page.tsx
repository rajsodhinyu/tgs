import Link from "next/link";
import { cookies } from "next/headers";
import { TGOS_SESSION_COOKIE, readSession, teamName } from "@/lib/tgos-auth";
import HomeScreenHint from "./HomeScreenHint";

const TOOLS = [
  {
    href: "/playlists/export",
    name: "Playlist export",
    description: "Crate, smoke break, and artist card images from a playlist.",
  },
];

export default async function Page() {
  const phone = await readSession((await cookies()).get(TGOS_SESSION_COOKIE)?.value);
  const name = phone ? teamName(phone) : "";
  return (
    <div className="mx-auto max-w-2xl pt-10">
      <div className="flex items-center justify-between">
        <h1 className="font-title text-4xl uppercase">{name ? `Hi, ${name}!` : "tgos"}</h1>
        <form action="/api/os/auth/logout" method="post">
          <button className="rounded-full bg-white/10 px-4 py-1.5 font-title text-sm uppercase hover:bg-white/20">
            log out
          </button>
        </form>
      </div>
      <ul className="mt-8 grid gap-3">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block rounded-2xl bg-white/10 p-5 transition-colors hover:bg-white/20"
            >
              <div className="font-title text-xl uppercase">{tool.name}</div>
              <div className="mt-1 font-roc text-sm text-white/70">{tool.description}</div>
            </Link>
          </li>
        ))}
      </ul>
      <HomeScreenHint />
    </div>
  );
}
