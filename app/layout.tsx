import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uranai · 個人占いダッシュボード",
  description: "Yoshida 専用のクローズドな占い環境。",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-midnight-900 text-sand-100">
        <header className="border-b border-copper-500/20 bg-midnight-900/60 backdrop-blur supports-[backdrop-filter]:bg-midnight-900/50 sticky top-0 z-20">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-display text-2xl tracking-wide text-copper-300 glow-copper">Uranai</span>
              <span className="text-copper-400/80 text-[10px] tracking-[0.4em] uppercase">私的占断</span>
            </Link>
            <nav className="text-xs text-sand-300 hidden sm:flex gap-5 tracking-wider">
              <Link href="/astrology" className="hover:text-copper-300 transition-colors">星占</Link>
              <Link href="/tarot" className="hover:text-copper-300 transition-colors">塔羅</Link>
              <Link href="/numerology" className="hover:text-copper-300 transition-colors">数秘</Link>
              <Link href="/iching" className="hover:text-copper-300 transition-colors">易経</Link>
              <Link href="/shichu" className="hover:text-copper-300 transition-colors">四柱</Link>
              <Link href="/fengshui" className="hover:text-copper-300 transition-colors">風水</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">{children}</main>
        <footer className="border-t border-copper-500/15 mt-24">
          <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-sand-400/80 text-center tracking-wider">
            個人利用専用・データは外部送信されません。
          </div>
        </footer>
      </body>
    </html>
  );
}

