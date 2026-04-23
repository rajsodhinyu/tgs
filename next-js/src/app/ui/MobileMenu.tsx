"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  {
    href: "/about",
    src: "https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png?h=200",
    alt: "About",
  },
  {
    href: "/blog",
    src: "https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200",
    alt: "Blog",
  },
  {
    href: "/events",
    src: "https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png?h=200",
    alt: "Events",
  },
  {
    href: "/shop",
    src: "https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200",
    alt: "Shop",
  },
  {
    href: "https://www.patreon.com/thatgoodshit",
    src: "https://cdn.sanity.io/images/fnvy29id/tgs/aaadb16ce9553cad7741d97aa957f4f9d1a9e830-4809x1503.png?h=200",
    alt: "Patreon",
  },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center">
        <Image
          src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
          width={80}
          height={48}
          alt="TGS"
          priority
        />
      </button>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
      <div
        className={`absolute top-full left-0 z-50 mt-2 bg-tgs-dark-purple rounded-lg pl-3 p-4 flex flex-col gap-6 min-w-max origin-top-left transition-all ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-75 -translate-y-2 pointer-events-none"
        }`}
        style={{
          transitionDuration: open ? "500ms" : "200ms",
          transitionTimingFunction: open
            ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "cubic-bezier(0.4, 0, 1, 1)",
        }}
      >
        {links.map(({ href, src, alt }, i) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`transition-all origin-left ${
              open ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
            style={{
              transitionDuration: open ? "450ms" : "150ms",
              transitionTimingFunction: open
                ? "cubic-bezier(0.34, 1.8, 0.64, 1)"
                : "ease-in",
              // transitionDelay: open ? `${50 + i * 80}ms` : "30ms",
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{ height: "2rem", width: "auto" }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
