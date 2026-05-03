import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uranai — 6つの占い",
  description: "西洋占星術・タロット・数秘術・易経・四柱推命・風水を1つに。",
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
              Uranai
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
            © {new Date().getFullYear()} Uranai · エンタメ目的。重要な判断は専門家にご相談ください。
          </div>
        </footer>
      </body>
    </html>
  );
}
