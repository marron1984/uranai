"use client";

import { useState } from "react";
import {
  castHexagram,
  hexagramFromYaos,
  changedHexagram,
  trigramName,
  yaoSymbol,
  type Yao,
} from "@/lib/iching";

export default function IChingPage() {
  const [question, setQuestion] = useState("");
  const [yaos, setYaos] = useState<Yao[] | null>(null);

  const onCast = () => {
    setYaos(castHexagram());
  };

  const hex = yaos ? hexagramFromYaos(yaos) : null;
  const changed = yaos ? changedHexagram(yaos) : null;

  return (
    <div>
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-400">
          I Ching
        </div>
        <h1 className="font-serif text-3xl mt-1">易経</h1>
        <p className="text-sm text-ink-500 mt-2">
          コイン3枚法で6本の爻（こう）を立て、64卦を導きます。
        </p>
      </header>

      <div className="space-y-3 mb-8 max-w-md">
        <label className="block">
          <span className="text-xs text-ink-500">問い（任意）</span>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: 今の仕事を続けるべきか"
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          />
        </label>
        <button
          onClick={onCast}
          className="rounded-md bg-ink-900 text-white px-5 py-2 hover:bg-ink-700"
        >
          卦を立てる
        </button>
      </div>

      {yaos && hex && (
        <section className="rounded-xl border border-ink-100 p-6">
          {question && (
            <div className="text-sm text-ink-500 mb-3">
              問い: <span className="text-ink-900">{question}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-400">
                本卦
              </div>
              <div className="font-serif text-2xl mt-1">
                {hex.num}. {hex.name}
              </div>
              <div className="text-xs text-ink-500">{hex.reading}</div>
              <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6">
                {[...yaos].reverse().map((y, i) => (
                  <div key={i}>{yaoSymbol(y)}</div>
                ))}
              </div>
              <div className="text-xs text-ink-400 mt-2 text-right pr-6">
                上卦: {trigramName(yaos, "upper")} / 下卦:{" "}
                {trigramName(yaos, "lower")}
              </div>
              <p className="mt-4 text-sm text-ink-700 leading-relaxed">
                {hex.meaning}
              </p>
            </div>

            {changed && (
              <div className="border-t sm:border-t-0 sm:border-l border-ink-100 sm:pl-6 pt-6 sm:pt-0">
                <div className="text-xs uppercase tracking-widest text-ink-400">
                  之卦（変化後）
                </div>
                <div className="font-serif text-2xl mt-1">
                  {changed.hex.num}. {changed.hex.name}
                </div>
                <div className="text-xs text-ink-500">
                  {changed.hex.reading}
                </div>
                <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6">
                  {[...changed.yaos].reverse().map((y, i) => (
                    <div key={i}>{yaoSymbol(y)}</div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-700 leading-relaxed">
                  {changed.hex.meaning}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
