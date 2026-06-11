"use client";

import { useEffect, useState, useRef } from "react";

export type ThemeId = "neobrutal" | "editorial" | "midnight" | "twilight" | "paper" | "cream" | "forest";

export const THEMES: { id: ThemeId; label: string; swatch: string; description: string }[] = [
  { id: "neobrutal", label: "ネオブルータル", swatch: "#fef9e7", description: "クリーム×漆黒×ビビッド (既定)" },
  { id: "editorial", label: "エディトリアル", swatch: "#fafaf7", description: "純白×漆黒の編集デザイン" },
  { id: "midnight",  label: "ミッドナイト",   swatch: "#0a0a0f", description: "深い闇と銅金" },
  { id: "twilight",  label: "トワイライト",   swatch: "#1f2a3a", description: "夕闇の青藍" },
  { id: "forest",    label: "フォレスト",     swatch: "#1a2620", description: "深緑と苔金" },
  { id: "paper",     label: "ペーパー",       swatch: "#f3ecdc", description: "明るい羊皮紙" },
  { id: "cream",     label: "クリーム",       swatch: "#fbf6e8", description: "最も明るい配色" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>("neobrutal");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (typeof window !== "undefined"
      ? (window.localStorage.getItem("uranai-theme") as ThemeId | null)
      : null);
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved);
    } else {
      const current = document.documentElement.getAttribute("data-theme") as ThemeId | null;
      if (current && THEMES.some((t) => t.id === current)) setTheme(current);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("uranai-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-copper-500/30 px-3 py-1.5 text-[11px] tracking-wider hover:border-copper-400/60 transition-colors theme-btn whitespace-nowrap"
        aria-label="テーマを変更"
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-copper-500/40 flex-shrink-0"
          style={{ background: current.swatch }}
        />
        <span className="hidden xl:inline whitespace-nowrap">{current.label}</span>
        <span className="text-[9px] opacity-60">▼</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-copper-500/30 bg-[var(--menu-bg,#1c1c28)] shadow-2xl z-30 overflow-hidden">
          <div className="px-4 py-2 text-[10px] tracking-[0.3em] uppercase text-copper-300 border-b border-copper-500/20">
            背景テーマ
          </div>
          <ul className="py-1">
            {THEMES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-copper-500/10 transition-colors ${
                    t.id === theme ? "bg-copper-500/15" : ""
                  }`}
                >
                  <span
                    className="inline-block h-5 w-5 rounded-full ring-1 ring-copper-500/40 flex-shrink-0"
                    style={{ background: t.swatch }}
                  />
                  <span className="flex-1">
                    <span className="block text-sm">{t.label}</span>
                    <span className="block text-[10px] opacity-60">{t.description}</span>
                  </span>
                  {t.id === theme && <span className="text-copper-300 text-xs">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
