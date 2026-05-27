import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import ThemeSwitcher from "./ThemeSwitcher";
import MobileMenu from "./MobileMenu";

export const metadata: Metadata = {
  title: "Uranai · 個人占いダッシュボード",
  description: "Yoshida 専用のクローズドな占い環境。",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fafaf7",
};

const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('uranai-theme');
    if (t && ['editorial','midnight','twilight','forest','paper','cream'].indexOf(t) >= 0) {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', 'editorial');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'editorial');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" data-theme="editorial">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen bg-midnight-900 text-sand-100">
        <header className="border-b border-copper-500/20 bg-midnight-900/60 backdrop-blur supports-[backdrop-filter]:bg-midnight-900/50 sticky top-0 z-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-baseline gap-2 sm:gap-3 min-w-0">
              <span className="editorial-display text-xl sm:text-2xl tracking-tight">URANAI</span>
              <span className="editorial-mono text-[10px] opacity-70 hidden md:inline">私的占断 ／ N°143</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="hidden sm:flex gap-1.5 items-center flex-wrap">
                <Link href="/astrology" className="editorial-chip text-[10px]"><span>星占</span></Link>
                <Link href="/tarot" className="editorial-chip text-[10px]"><span>塔羅</span></Link>
                <Link href="/numerology" className="editorial-chip text-[10px]"><span>数秘</span></Link>
                <Link href="/iching" className="editorial-chip text-[10px]"><span>易経</span></Link>
                <Link href="/shichu" className="editorial-chip text-[10px]"><span>四柱</span></Link>
                <Link href="/fengshui" className="editorial-chip text-[10px]"><span>風水</span></Link>
                <Link href="/mbti" className="editorial-chip text-[10px]"><span>MBTI</span></Link>
                <Link href="/compat" className="editorial-chip editorial-chip-dark text-[10px]"><span>相性</span></Link>
              </nav>
              <ThemeSwitcher />
              <MobileMenu />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-12">{children}</main>
        <footer className="border-t border-copper-500/15 mt-16 sm:mt-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 text-xs text-sand-400/80 text-center tracking-wider">
            個人利用専用・データは外部送信されません。
          </div>
        </footer>
      </body>
    </html>
  );
}

