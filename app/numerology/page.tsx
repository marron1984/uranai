"use client";

import { useState } from "react";
import {
  lifePathNumber,
  soulNumber,
  personalityNumber,
  LIFE_PATH_MEANINGS,
} from "@/lib/numerology";

export default function NumerologyPage() {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [result, setResult] = useState<{
    life: number;
    soul: number;
    persona: number;
  } | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birth) return;
    setResult({
      life: lifePathNumber(birth),
      soul: name ? soulNumber(name) : 0,
      persona: name ? personalityNumber(name) : 0,
    });
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-400">
          Numerology
        </div>
        <h1 className="font-serif text-3xl mt-1">数秘術</h1>
        <p className="text-sm text-ink-500 mt-2">
          生年月日と名前（ローマ字）から、あなたの数字を導きます。
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-3 mb-10 max-w-md">
        <label className="block">
          <span className="text-xs text-ink-500">生年月日</span>
          <input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            required
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-500">
            氏名（ローマ字 / 任意）
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: TARO YAMADA"
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-ink-900 text-white px-5 py-2 hover:bg-ink-700"
        >
          数字を導く
        </button>
      </form>

      {result && (
        <section className="space-y-4">
          <NumberCard
            label="ライフパスナンバー"
            sub="人生全体の傾向"
            value={result.life}
          />
          {name && (
            <>
              <NumberCard
                label="ソウルナンバー"
                sub="心の奥にある本質"
                value={result.soul}
              />
              <NumberCard
                label="パーソナリティナンバー"
                sub="周囲に映る印象"
                value={result.persona}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

function NumberCard({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: number;
}) {
  const meaning = LIFE_PATH_MEANINGS[String(value)];
  return (
    <article className="rounded-xl border border-ink-100 p-6 flex gap-6 items-center">
      <div className="font-serif text-6xl tabular-nums">{value}</div>
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-400">
          {label}
        </div>
        <div className="text-sm text-ink-500">{sub}</div>
        {meaning && (
          <>
            <div className="font-serif text-lg mt-2">{meaning.title}</div>
            <p className="text-sm text-ink-700 mt-1">{meaning.text}</p>
          </>
        )}
      </div>
    </article>
  );
}
