"use client";

// 動物占い (個性心理学・60キャラクター)
// 60表は 2026-06 のサブエージェント並列リサーチで収集・突合 (lib/animal.ts 参照)。

import { useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import { ANIMAL_CHARS, ANIMAL_TRAITS, animalChar, animalCompat, type AnimalChar } from "@/lib/animal";

const ANIMAL_EMOJI: Record<string, string> = {
  狼: "🐺", こじか: "🦌", 猿: "🐵", チータ: "🐆", 黒ひょう: "🐈‍⬛", ライオン: "🦁",
  虎: "🐯", たぬき: "🦝", コアラ: "🐨", ゾウ: "🐘", ひつじ: "🐑", ペガサス: "🦄",
};

function CharCard({ c, label }: { c: AnimalChar; label: string }) {
  const t = ANIMAL_TRAITS[c.animal];
  return (
    <div className="border-2 border-current p-4">
      <div className="editorial-mono text-[10px] opacity-60">{label}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-3xl">{ANIMAL_EMOJI[c.animal]}</span>
        <div>
          <div className="editorial-display-jp text-lg leading-tight">{c.name}</div>
          <div className="editorial-mono text-[9px] opacity-60">
            No.{c.num} {c.ganzhi} ／ {t.group}グループ
          </div>
        </div>
      </div>
      <p className="text-xs leading-relaxed mt-2 opacity-85">{t.traits}</p>
    </div>
  );
}

export default function AnimalPage() {
  const me = useMemo(() => animalChar(OWNER.birth), []);
  const myTraits = ANIMAL_TRAITS[me.animal];
  const wife = useMemo(() => animalChar(OWNER.family.spouse.birth), []);
  const child = useMemo(() => animalChar(OWNER.family.child.birth), []);

  const [otherBirth, setOtherBirth] = useState("");
  const other = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    try { return animalChar(otherBirth); } catch { return null; }
  }, [otherBirth]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Animal</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">動物占い</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          {ANIMAL_EMOJI[me.animal]} {me.animal}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          あなたは「{me.name}」── 60分の1の個性。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          生まれ日の六十干支 (No.{me.num} {me.ganzhi}) から60キャラクターを判定する個性心理学ベース。
          対応表は複数ソースを突合して収集。
        </p>
      </header>

      {/* あなたのキャラクター */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">あなたのキャラクター ／ Your Character</div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-6xl">{ANIMAL_EMOJI[me.animal]}</span>
          <div>
            <div className="editorial-display-jp text-3xl sm:text-4xl">{me.name}</div>
            <div className="editorial-mono text-xs opacity-60 mt-1">
              No.{me.num} {me.ganzhi} ／ {myTraits.group}グループ
            </div>
          </div>
        </div>
        <p className="text-sm sm:text-base leading-relaxed mt-5">{myTraits.traits}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">恋愛・家庭</div>
            <p className="text-sm mt-1 leading-relaxed">{myTraits.love}</p>
          </div>
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">仕事</div>
            <p className="text-sm mt-1 leading-relaxed">{myTraits.work}</p>
          </div>
        </div>
        {me.confidence === "弱" && (
          <p className="editorial-mono text-[9px] opacity-50 mt-4">
            ※ このキャラ名の出典は単一ソース。複数ソース突合済みの番号は表の [確] 印参照。
          </p>
        )}
      </section>

      {/* 家族 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">家族のキャラクター ／ Family</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <CharCard c={wife} label="妻" />
            <p className="text-xs opacity-70 mt-2 leading-relaxed">
              <span className="editorial-chip text-[9px] mr-1.5">{animalCompat(me, wife).level}</span>
              {animalCompat(me, wife).text}
            </p>
          </div>
          <div>
            <CharCard c={child} label="子" />
            <p className="text-xs opacity-70 mt-2 leading-relaxed">
              <span className="editorial-chip text-[9px] mr-1.5">{animalCompat(me, child).level}</span>
              {animalCompat(me, child).text}
            </p>
          </div>
        </div>
      </section>

      {/* 任意の相手 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">相手を調べる ／ Lookup</div>
        <label className="block max-w-xs">
          <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 生年月日</span>
          <input
            type="date"
            value={otherBirth}
            onChange={(e) => setOtherBirth(e.target.value)}
            className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
          />
        </label>
        {other && (
          <div className="mt-5">
            <CharCard c={other} label="相手" />
            <p className="text-sm mt-3 leading-relaxed">
              <span className="editorial-chip text-[10px] mr-2">{animalCompat(me, other).level}</span>
              {animalCompat(me, other).text}
            </p>
          </div>
        )}
      </section>

      {/* 60キャラ一覧 */}
      <section>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">60キャラクター一覧 ／ All Characters</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ANIMAL_CHARS.map((c) => (
            <div key={c.num} className={`border-2 border-current p-2.5 ${c.num === me.num ? "tab-btn-active" : ""}`}>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{ANIMAL_EMOJI[c.animal]}</span>
                <span className="editorial-display-jp text-xs leading-tight">{c.name}{c.num === me.num && " ★"}</span>
              </div>
              <div className="editorial-mono text-[8px] opacity-60 mt-1">
                No.{c.num} {c.ganzhi} {c.confidence === "確" ? "[確]" : ""}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
