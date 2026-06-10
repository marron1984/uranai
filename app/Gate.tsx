"use client";

// アクセスゲート — クローズドサイトの玄関
// 認証成功まで子コンポーネントを render しない (= 占断データを描画しない)

import { useEffect, useRef, useState } from "react";
import { readUnlockState, verifyPassphrase, persistUnlock, clearUnlock } from "@/lib/gate";

type GateState = "checking" | "locked" | "unlocked";

export default function Gate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(readUnlockState() ? "unlocked" : "locked");
  }, []);

  useEffect(() => {
    if (state === "locked" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await verifyPassphrase(input);
      if (ok) {
        persistUnlock();
        setState("unlocked");
      } else {
        setError("パスフレーズが一致しません");
        setInput("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 検証中 (hydration まで)
  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="editorial-mono text-xs opacity-50">…</div>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <div className="w-full max-w-md">
          {/* 巨大ロゴ + ステッカー */}
          <div className="text-center mb-12 relative">
            <div className="editorial-display text-6xl sm:text-7xl tracking-tight">URANAI</div>
            <div className="editorial-mono text-[10px] opacity-60 mt-2">私的占断 ／ Private</div>
            <span className="nb-sticker nb-sticker-pink absolute -top-2 -right-4 sm:right-0">VIP ONLY</span>
          </div>

          {/* 鍵アイコン */}
          <div className="flex justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="10" y="22" width="28" height="20" rx="2" />
              <path d="M16 22 v-6 a8 8 0 0 1 16 0 v6" />
              <circle cx="24" cy="32" r="2" fill="currentColor" />
            </svg>
          </div>

          <div className="text-center mb-6">
            <h1 className="editorial-display-jp text-2xl sm:text-3xl">クローズドサイト</h1>
            <p className="text-xs sm:text-sm opacity-70 mt-2 leading-relaxed">
              このサイトは吉田駿成氏個人専用の占断環境です。<br />
              アクセスにはパスフレーズが必要です。
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="editorial-mono text-[10px] opacity-70">PASSPHRASE</span>
              <input
                ref={inputRef}
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base sm:text-lg min-h-[44px]"
                disabled={submitting}
              />
            </label>

            {error && (
              <div className="text-xs px-3 py-2 border border-red-500/60 text-red-400 bg-red-500/10">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!input || submitting}
              className="w-full editorial-chip editorial-chip-dark min-h-[48px] justify-center disabled:opacity-40 text-base"
            >
              {submitting ? "認証中..." : "Unlock ／ 解錠"}
            </button>
          </form>

          <p className="editorial-mono text-[9px] opacity-50 text-center mt-8 leading-relaxed">
            パスフレーズをお忘れの場合は、サイトオーナーまでお問い合わせください。<br />
            データは外部に送信されません (個人利用専用)。
          </p>
        </div>
      </div>
    );
  }

  // unlocked
  return (
    <>
      {children}
      <LockoutButton onLock={() => { clearUnlock(); setState("locked"); }} />
    </>
  );
}

// ヘッダーや footer に置く小さな「ロック」ボタン
function LockoutButton({ onLock }: { onLock: () => void }) {
  return (
    <button
      type="button"
      onClick={onLock}
      title="サイトをロックする"
      className="fixed bottom-3 right-3 z-10 opacity-30 hover:opacity-100 transition-opacity editorial-mono text-[10px] px-2 py-1 border border-current bg-[var(--background)]"
      aria-label="ロックする"
    >
      🔒 Lock
    </button>
  );
}
