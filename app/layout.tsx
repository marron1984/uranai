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
      <body className="min-h-screen bg-white text-ink-900">
        <header className="border-b border-ink-100">
          <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-tight">
              Uranai <span className="text-ink-400 text-xs ml-2">PRIVATE</span>
            </Link>
            <nav className="text-sm text-ink-500 hidden sm:flex gap-6">
              <Link href="/astrology" className="hover:text-ink-900">星占い</Link>
              <Link href="/tarot" className="hover:text-ink-900">タロット</Link>
              <Link href="/numerology" className="hover:text-ink-900">数秘術</Link>
              <Link href="/iching" className="hover:text-ink-900">易経</Link>
              <Link href="/shichu" className="hover:text-ink-900">四柱推命</Link>
              <Link href="/fengshui" className="hover:text-ink-900">風水</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="border-t border-ink-100 mt-20">
          <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-ink-400">
            個人利用専用 · データはブラウザに保存され、外部送信されません。
          </div>
        </footer>
      </body>
    </html>
  );
}
