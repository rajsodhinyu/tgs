import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TGOS",
  description: "That Good Sh*t internal tools.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen px-3 pb-10 text-white">{children}</div>;
}
