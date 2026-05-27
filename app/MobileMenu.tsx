"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "ホーム", sub: "HOME" },
  { href: "/astrology", label: "星占", sub: "ASTROLOGY" },
  { href: "/tarot", label: "塔羅", sub: "TAROT" },
  { href: "/numerology", label: "数秘", sub: "NUMEROLOGY" },
  { href: "/iching", label: "易経", sub: "I-CHING" },
  { href: "/shichu", label: "四柱", sub: "SHICHU" },
  { href: "/fengshui", label: "風水", sub: "FENGSHUI" },
  { href: "/mbti", label: "MBTI", sub: "16 TYPES" },
  { href: "/compat", label: "相性", sub: "COMPATIBILITY", dark: true },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // 開いている時は body スクロールロック
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 経路変更時に閉じる (簡易: クリック後 100ms)
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="メニューを開く"
        onClick={() => setOpen(true)}
        className="sm:hidden flex flex-col gap-[5px] p-2 -mr-2 group"
      >
        <span className="block w-6 h-[2px] bg-current" />
        <span className="block w-6 h-[2px] bg-current" />
        <span className="block w-6 h-[2px] bg-current" />
      </button>

      {/* オーバーレイ */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-current">
            <span className="editorial-display text-2xl">URANAI</span>
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={() => setOpen(false)}
              className="p-2 -mr-2"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" stroke="currentColor" strokeWidth="2">
                <line x1="6" y1="6" x2="22" y2="22" />
                <line x1="22" y1="6" x2="6" y2="22" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block border border-current p-4 transition-colors ${
                  l.dark ? "tab-btn-active" : "hover:bg-black/5"
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="editorial-mono text-[10px] opacity-70">{l.sub}</span>
                  <span className="editorial-display-jp text-2xl">{l.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-current text-center">
            <span className="editorial-mono text-[9px] opacity-60">
              私的占断 ／ N°143 ／ {OWNER_NAME}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

const OWNER_NAME = "しゅんすけ";
