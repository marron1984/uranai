"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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

const OWNER_NAME = "しゅんすけ";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 開いている間 body スクロールロック
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      // アンマウント or 依存変更時の確実な解除
      document.body.style.overflow = "";
    };
  }, [open]);

  // ページ遷移を検知したら確実に閉じる (soft route でも反応する)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC で閉じる
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
      {/* ハンバーガーボタン — 視認性のため枠+影付き */}
      <button
        type="button"
        aria-label="メニューを開く"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="sm:hidden flex flex-col items-center justify-center gap-[5px] w-11 h-11 border-2 border-current bg-[var(--background)]"
        style={{ boxShadow: "3px 3px 0 0 currentColor" }}
      >
        <span className="block w-5 h-[2.5px] bg-current" />
        <span className="block w-5 h-[2.5px] bg-current" />
        <span className="block w-5 h-[2.5px] bg-current" />
      </button>

      {/* オーバーレイ — z-index 強化 */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-[100] flex flex-col"
          style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
          <div className="flex items-center justify-between p-4 border-b-[3px] border-current">
            <span className="editorial-display text-2xl">URANAI</span>
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={() => setOpen(false)}
              className="w-11 h-11 flex items-center justify-center border-2 border-current bg-[var(--background)]"
              style={{ boxShadow: "3px 3px 0 0 currentColor" }}
            >
              <svg width="22" height="22" viewBox="0 0 28 28" stroke="currentColor" strokeWidth="2.5">
                <line x1="6" y1="6" x2="22" y2="22" />
                <line x1="22" y1="6" x2="6" y2="22" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => {
                  // 確実に閉じる (pathname effect が走る前に手動で setOpen)
                  setOpen(false);
                  // body スクロールロックも即時解除 (タイミング保険)
                  document.body.style.overflow = "";
                }}
                className={`block border-2 border-current p-4 ${
                  l.dark ? "tab-btn-active" : ""
                }`}
                style={{ boxShadow: "4px 4px 0 0 currentColor" }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="editorial-mono text-[10px] opacity-70">{l.sub}</span>
                  <span className="editorial-display-jp text-2xl">{l.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t-[3px] border-current text-center">
            <span className="editorial-mono text-[9px] opacity-60">
              私的占断 ／ N°143 ／ {OWNER_NAME}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
