import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import ServiceWorker from "./ServiceWorker";
import "./globals.css";

const bitcount = localFont({ src: "../fonts/bitcount.ttf", variable: "--nf-bitcount" });
const bitcountFilled = localFont({ src: "../fonts/bitcount-filled.ttf", variable: "--nf-bitcount-filled" });
const roc = localFont({
  src: [
    { path: "../fonts/roc-regular.ttf", weight: "400" },
    { path: "../fonts/roc-medium.ttf", weight: "500" },
  ],
  variable: "--nf-roc",
});

export const metadata: Metadata = {
  title: "tgos",
  description: "That Good Sh*t internal tools.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "tgos", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#191A24",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bitcount.variable} ${bitcountFilled.variable} ${roc.variable}`}>
      <body className="bg-tgs-ink text-white antialiased">
        <main className="min-h-dvh bg-radial from-tgs-dark-purple to-tgs-pink px-3 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),2.5rem)]">
          <ViewTransition>{children}</ViewTransition>
        </main>
        <ServiceWorker />
      </body>
    </html>
  );
}
