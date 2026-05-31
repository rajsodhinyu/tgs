"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Runs before paint on the client, falls back to a no-op effect during SSR so
// React doesn't warn about useLayoutEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// md:gap-x-8 → 2rem between the title and the byline/switcher module.
const ROW_GAP_PX = 32;

/**
 * Title + byline/switcher bar for blog posts.
 *
 * When the title fits on a single line beside the module, they sit inline:
 * title left, module right. The moment the title would run out of room (and
 * therefore wrap), we switch the whole bar to a centered stacked layout
 * instead. The decision is measured from the title's real one-line width via a
 * hidden probe, so it adapts to the actual title rather than a length guess.
 */
export default function BlogTitleBar({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);
  // Default inline; the layout effect corrects before paint.
  const [stacked, setStacked] = useState(false);

  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    const probe = probeRef.current;
    const moduleEl = moduleRef.current;
    if (!container || !probe || !moduleEl) return;

    const measure = () => {
      const cs = getComputedStyle(container);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const available = container.clientWidth - padX;
      const needed = probe.offsetWidth + ROW_GAP_PX + moduleEl.offsetWidth;
      setStacked(needed > available);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [title]);

  return (
    <div
      ref={containerRef}
      className={`w-full mx-auto max-w-[1400px] px-3 mt-4 pb-2 flex gap-2 ${
        stacked ? "flex-col items-center" : "flex-row items-end gap-x-8"
      }`}
    >
      {/* Hidden probe: the title at its intrinsic one-line width, used purely
          to measure whether the inline layout fits. */}
      <span
        ref={probeRef}
        aria-hidden
        className="text-4xl font-bold font-title uppercase whitespace-nowrap absolute invisible -z-10 pointer-events-none"
      >
        {title}
      </span>
      <div
        className={`text-4xl font-bold font-title uppercase ${
          stacked
            ? "text-center"
            : "text-left flex-1 min-w-0 whitespace-nowrap"
        }`}
      >
        {title}
      </div>
      <div
        ref={moduleRef}
        className={`flex items-center gap-6 xl:text-xl text-xl font-roc font-medium text-white/80 shrink-0 ${
          stacked ? "justify-center" : "justify-start"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
