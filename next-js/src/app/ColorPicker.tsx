"use client";

import { useState, useRef, useEffect } from "react";

export default function ColorPicker({
  children,
}: {
  children: React.ReactNode;
}) {
  const [color, setColor] = useState("#3E3E42");
  const [textWhite, setTextWhite] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = color;
      containerRef.current.style.color = textWhite ? "white" : "black";
    }
  }, [color, textWhite]);

  return (
    <div ref={containerRef} className="min-w-80 pb-10 min-h-screen">
      {open && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg border border-white/20">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 cursor-pointer rounded border-none bg-transparent"
          />
          <span className="text-white font-mono text-lg select-all">
            {color.toUpperCase()}
          </span>
          <button
            onClick={() => setTextWhite(!textWhite)}
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              textWhite
                ? "bg-white text-black border-white"
                : "bg-black text-white border-white/40"
            }`}
          >
            {textWhite ? "WHITE" : "BLACK"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white text-xl ml-2"
          >
            &times;
          </button>
        </div>
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 right-4 z-50 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-black/80"
        >
          BG
        </button>
      )}
      {children}
    </div>
  );
}
