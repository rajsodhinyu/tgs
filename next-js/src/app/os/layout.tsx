import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "tgos",
  description: "That Good Sh*t internal tools.",
  robots: { index: false, follow: false },
  manifest: "/tgos/manifest.webmanifest",
  icons: {
    icon: "/tgos/icon-192.png",
    apple: "/tgos/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "tgos", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#191A24" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen px-3 pb-10 text-white">{children}</div>;
}
