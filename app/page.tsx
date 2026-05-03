import Link from "next/link";

const cards = [
  {
    href: "/astrology",
    title: "西洋占星術",
    en: "Astrology",
    desc: "生年月日から太陽星座を導き、性格と今日の運勢を読みます。",
  },
  {
    href: "/tarot",
    title: "タロット",
    en: "Tarot",
    desc: "78枚のカードから引いた1枚／3枚で過去・現在・未来を占います。",
  },
  {
    href: "/numerology",
    title: "数秘術",
    en: "Numerology",
    desc: "生年月日と氏名から、あなたの数字（ライフパス）を割り出します。",
  },
  {
    href: "/iching",
    title: "易経",
    en: "I Ching",
    desc: "コイン3枚法で6本の爻を立て、64卦の卦辞・爻辞を読みます。",
  },
  {
    href: "/shichu",
    title: "四柱推命",
    en: "Shichu Suimei",
    desc: "生年月日時から年月日時の四柱（八字）を算出して命式を表示。",
  },
  {
    href: "/fengshui",
    title: "風水（本命卦）",
    en: "Feng Shui",
    desc: "本命卦から東四命／西四命を判定し、8方位の吉凶を表示します。",
  },
];

export default function Home() {
  return (
    <div>
      <section className="py-10 sm:py-16">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">
          6つの占いを、ひとつに。
        </h1>
        <p className="mt-4 text-ink-500 max-w-xl">
          西洋占星術・タロット・数秘術・易経・四柱推命・風水。
          世界中で読み継がれてきた占術を、シンプルな入力でお届けします。
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group block rounded-xl border border-ink-100 p-6 hover:border-ink-900 transition-colors"
          >
            <div className="text-xs uppercase tracking-widest text-ink-400">
              {c.en}
            </div>
            <div className="mt-2 font-serif text-2xl">{c.title}</div>
            <p className="mt-3 text-sm text-ink-500 leading-relaxed">{c.desc}</p>
            <div className="mt-6 text-sm text-ink-900 group-hover:underline">
              占う →
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
