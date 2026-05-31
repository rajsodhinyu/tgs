"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateBgCss, type BgStyle } from "./bgStyle";

const STYLE_TAG_ID = "blog-bg-styles";
const LS_KEY = "tgs:blog-bg-style:draft";

/** Hot-swap the live stylesheet contents. */
function applyToDom(style: BgStyle) {
  const el = document.getElementById(STYLE_TAG_ID);
  if (el) el.textContent = generateBgCss(style);
}

/** Normalize an arbitrary string into a 6-digit `#rrggbb` for the color input. */
function toHex(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, r, g, b] = v.match(/^#(.)(.)(.)$/)!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "#191a24";
}

export default function BgColorTuner({
  initial,
  raised = false,
}: {
  initial: BgStyle;
  /** Sit the collapsed button above the reader's bg-switch button. */
  raised?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<BgStyle>(initial);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [pos, setPos] = useState({ x: 16, y: 80 });
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setStyle({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyToDom(style);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(style));
    } catch {
      /* ignore */
    }
    setSaveState("idle");
  }, [style]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setColor = useCallback(
    (color: string) => setStyle((s) => ({ ...s, color })),
    [],
  );

  const onDragMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: e.clientX - dragRef.current.dx,
      y: e.clientY - dragRef.current.dy,
    });
  }, []);

  const stopDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", stopDrag);
  }, [onDragMove]);

  const startDrag = (e: React.MouseEvent) => {
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", stopDrag);
  };

  const save = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/bg-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(style),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveState("saved");
      try {
        localStorage.removeItem(LS_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      setSaveState("error");
    }
  };

  const resetToSaved = () => {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    setStyle(initial);
  };

  const copyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(style, null, 2));
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Tune background color (⌥B)"
        style={{ ...fab, background: style.color, ...(raised ? { bottom: 72 } : {}) }}
      >
        <span style={fabDot} />
      </button>
    );
  }

  const hex = toHex(style.color);

  return (
    <div style={{ ...panel, left: pos.x, top: pos.y }}>
      <div style={header} onMouseDown={startDrag}>
        <span style={{ fontWeight: 700, letterSpacing: 0.4 }}>Background</span>
        <button onClick={() => setOpen(false)} style={iconBtn} title="Close (⌥B)">
          ✕
        </button>
      </div>

      <div style={body}>
        <div style={hint}>Page background color for blog posts.</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="color"
            value={hex}
            onChange={(e) => setColor(e.target.value)}
            style={swatch}
            title="Pick a color"
          />
          <input
            type="text"
            value={style.color}
            onChange={(e) => setColor(e.target.value)}
            spellCheck={false}
            style={hexInput}
            title="Any CSS color"
          />
        </div>
      </div>

      <div style={footer}>
        <button onClick={resetToSaved} style={ghostBtn} title="Discard live tweaks">
          Reset
        </button>
        <button onClick={copyJson} style={ghostBtn} title="Copy JSON to clipboard">
          Copy
        </button>
        <button
          onClick={save}
          disabled={saveState === "saving"}
          style={{
            ...saveBtn,
            ...(saveState === "saved" ? { background: "#3ddc97" } : {}),
            ...(saveState === "error" ? { background: "#ff6b6b" } : {}),
          }}
        >
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved ✓"
              : saveState === "error"
                ? "Error — retry"
                : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ---------- inline styles ---------- */

const fab: React.CSSProperties = {
  position: "fixed",
  left: 16,
  bottom: 16,
  zIndex: 99999,
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
};

const fabDot: React.CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.85)",
};

const panel: React.CSSProperties = {
  position: "fixed",
  zIndex: 99999,
  width: 264,
  display: "flex",
  flexDirection: "column",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(18,19,28,0.92)",
  color: "#fff",
  fontFamily: "system-ui, sans-serif",
  fontSize: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
  backdropFilter: "blur(12px)",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  cursor: "move",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(108,92,190,0.25)",
  userSelect: "none",
};

const body: React.CSSProperties = {
  padding: "14px 12px",
};

const hint: React.CSSProperties = {
  fontSize: 10.5,
  lineHeight: 1.4,
  opacity: 0.6,
  marginBottom: 12,
};

const swatch: React.CSSProperties = {
  width: 44,
  height: 36,
  padding: 0,
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  background: "transparent",
  cursor: "pointer",
};

const hexInput: React.CSSProperties = {
  flex: 1,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  color: "#fff",
  padding: "7px 8px",
  fontSize: 13,
  fontFamily: "ui-monospace, monospace",
};

const footer: React.CSSProperties = {
  display: "flex",
  gap: 8,
  padding: "10px 12px",
  borderTop: "1px solid rgba(255,255,255,0.12)",
};

const iconBtn: React.CSSProperties = {
  marginLeft: "auto",
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  opacity: 0.8,
};

const ghostBtn: React.CSSProperties = {
  flex: 1,
  padding: "7px 8px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
};

const saveBtn: React.CSSProperties = {
  flex: 1.4,
  padding: "7px 8px",
  background: "#ed9df9",
  border: "none",
  borderRadius: 8,
  color: "#1a1b23",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};
