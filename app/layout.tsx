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
      <body className="min-h-screen bg-ink-50 text-ink-900">
        <header className="bg-kachi-fade text-sand-50 border-b-2 border-gold-500">
          <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-display text-2xl tracking-wide">Uranai</span>
              <span className="text-gold-300 text-[10px] tracking-[0.4em] uppercase">私的占断</span>
            </Link>
            <nav className="text-xs text-sand-200 hidden sm:flex gap-5 tracking-wider">
              <Link href="/astrology" className="hover:text-gold-300">星占</Link>
              <Link href="/tarot" className="hover:text-gold-300">塔羅</Link>
              <Link href="/numerology" className="hover:text-gold-300">数秘</Link>
              <Link href="/iching" className="hover:text-gold-300">易経</Link>
              <Link href="/shichu" className="hover:text-gold-300">四柱</Link>
              <Link href="/fengshui" className="hover:text-gold-300">風水</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">{children}</main>
        <footer className="border-t border-ink-200 mt-24 bg-sand-50">
          <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-ink-500 text-center tracking-wider">
            個人利用専用・データは外部送信されません。
          </div>
        </footer>
      </body>
    </html>
  );
}

