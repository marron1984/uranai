"use client";

// 四柱推命 — 本人の命式 (甲子・戊辰・戊申・己未) を開いた瞬間に表示。
// 任意の生年月日時での算出も併設。

import { useMemo, useState } from "react";
import { OWNER, calcAge } from "@/lib/owner";
import {
  calcFourPillars,
  tongbianStar,
  twelveStage,
  hiddenStemTongbian,
  fiveElementBalance,
  generateDaiun,
  calcRuiun,
  DAY_MASTER_TEXT,
  STEM_ELEMENT,
  type FourPillars,
  type Pillar,
} from "@/lib/shichu";

const ELEM_COLOR: Record<string, string> = {
  木: "#1fc7a0",
  火: "#ff5c5c",
  土: "#ffb800",
  金: "#8a9bb8",
  水: "#5c9eff",
};

function PillarBox({ label, pillar, dayStem, isDay }: { label: string; pillar: Pillar; dayStem: string; isDay?: boolean }) {
  const star = isDay ? "日主" : tongbianStar(dayStem, pillar.stem);
  const stage = twelveStage(dayStem, pillar.branch);
  const hidden = hiddenStemTongbian(dayStem, pillar.branch);
  return (
    <div className={`border-2 border-current p-3 sm:p-4 ${isDay ? "tab-btn-active" : ""}`}>
      <div className="editorial-mono text-[9px] opacity-60">{label}</div>
      <div className="editorial-display-jp text-3xl sm:text-4xl mt-1">{pillar.ganzhi}</div>
      <div className="flex flex-wrap gap-1 mt-2 editorial-mono text-[9px]">
        <span className="border border-current px-1.5 py-0.5">{star}</span>
        <span className="border border-current px-1.5 py-0.5">{stage}</span>
      </div>
      <div className="editorial-mono text-[8px] opacity-60 mt-2 leading-relaxed">
        蔵干: {hidden.map((h) => `${h.stem}(${h.star})`).join(" ")}
      </div>
    </div>
  );
}

function FourPillarsView({ fp }: { fp: FourPillars }) {
  const dayStem = fp.day.stem;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <PillarBox label="年柱 ／ 祖先・社会" pillar={fp.year} dayStem={dayStem} />
      <PillarBox label="月柱 ／ 仕事・両親" pillar={fp.month} dayStem={dayStem} />
      <PillarBox label="日柱 ／ 自分・配偶者" pillar={fp.day} dayStem={dayStem} isDay />
      {fp.hour ? (
        <PillarBox label="時柱 ／ 子供・晩年" pillar={fp.hour} dayStem={dayStem} />
      ) : (
        <div className="border-2 border-current border-dashed p-3 sm:p-4 opacity-50">
          <div className="editorial-mono text-[9px]">時柱 ／ 出生時刻未入力</div>
        </div>
      )}
    </div>
  );
}

function ElementBars({ fp }: { fp: FourPillars }) {
  const balance = fiveElementBalance(fp);
  const max = Math.max(...Object.values(balance), 1);
  return (
    <div className="space-y-2">
      {(Object.entries(balance) as [string, number][]).map(([elem, n]) => (
        <div key={elem} className="flex items-center gap-3">
          <span className="editorial-display-jp text-base w-6">{elem}</span>
          <div className="flex-1 h-4 border border-current relative">
            <div className="absolute top-0 bottom-0 left-0" style={{ width: `${(n / max) * 100}%`, background: ELEM_COLOR[elem] }} />
          </div>
          <span className="editorial-mono text-[10px] w-6 text-right">{n}</span>
        </div>
      ))}
    </div>
  );
}

export default function ShichuPage() {
  // 本人の命式
  const [by, bm, bd] = OWNER.birth.split("-").map(Number);
  const myFp = useMemo(() => calcFourPillars(by, bm, bd, OWNER.hour), [by, bm, bd]);
  const myAge = calcAge(OWNER.birth);

  const daiun = useMemo(() => {
    const ruiun = calcRuiun(OWNER.birth, myFp.year.stem, OWNER.gender);
    return generateDaiun(myFp.month.ganzhi, ruiun.startingAge, ruiun.forward, 9, myAge, myFp.day.stem);
  }, [myFp, myAge]);
  const currentDaiun = daiun.find((p) => p.isCurrent);

  // 任意の相手
  const [otherBirth, setOtherBirth] = useState("");
  const [otherHour, setOtherHour] = useState("");
  const otherFp = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    const [y, m, d] = otherBirth.split("-").map(Number);
    const h = otherHour === "" ? null : Number(otherHour);
    try { return calcFourPillars(y, m, d, h); } catch { return null; }
  }, [otherBirth, otherHour]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Four Pillars</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">四柱推命</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          {myFp.day.ganzhi}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          日主は{myFp.day.stem} ({STEM_ELEMENT[myFp.day.stem]}) ── 八字に刻まれた、あなたの設計図。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          {OWNER.birth} {OWNER.hour}:00 生 → 甲子・戊辰・戊申・己未。
          ※ 節気は簡易計算 (境界日±1日は誤差の可能性)。
        </p>
      </header>

      {/* 命式 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">あなたの命式 ／ Eight Characters</div>
        <FourPillarsView fp={myFp} />
        <p className="text-sm sm:text-base leading-relaxed mt-6">{DAY_MASTER_TEXT[myFp.day.stem]}</p>
      </section>

      {/* 五行バランス */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">五行バランス ／ Five Elements</div>
        <ElementBars fp={myFp} />
        <p className="editorial-mono text-[9px] opacity-50 mt-4">
          天干と地支 (蔵干含まず) の数。土が厚く水を蓄える命式 ── 詳しい読みはホームの「基礎」タブへ。
        </p>
      </section>

      {/* 大運 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">大運 ／ 10年ごとの運気</div>
        {currentDaiun && (
          <div className="border-2 border-current p-4 mb-4 tab-btn-active">
            <div className="editorial-mono text-[9px]">現在の大運 ({currentDaiun.startAge}〜{currentDaiun.endAge}歳)</div>
            <div className="editorial-display-jp text-3xl mt-1">{currentDaiun.ganzhi}</div>
            <p className="text-sm leading-relaxed mt-2">{currentDaiun.theme}</p>
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {daiun.map((p) => (
            <div key={p.startAge} className={`border border-current p-2 text-center ${p.isCurrent ? "tab-btn-active" : ""}`}>
              <div className="editorial-mono text-[8px] opacity-60">{p.startAge}〜</div>
              <div className="editorial-display-jp text-base">{p.ganzhi}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 任意の相手 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">他の人の命式 ／ Lookup</div>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 生年月日</span>
            <input
              type="date"
              value={otherBirth}
              onChange={(e) => setOtherBirth(e.target.value)}
              className="mt-1 block border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
            />
          </label>
          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">HOUR ／ 出生時刻 0-23 (任意)</span>
            <input
              type="number"
              min={0}
              max={23}
              value={otherHour}
              onChange={(e) => setOtherHour(e.target.value)}
              placeholder="14"
              className="mt-1 block w-28 border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
            />
          </label>
        </div>
        {otherFp && (
          <div className="mt-6">
            <FourPillarsView fp={otherFp} />
            <p className="text-sm leading-relaxed mt-4">{DAY_MASTER_TEXT[otherFp.day.stem]}</p>
            <p className="text-xs opacity-70 mt-2">
              あなた (日主{myFp.day.stem}) から見た相手の日主{otherFp.day.stem}: {otherFp.day.stem === myFp.day.stem ? "比肩 ── 同じ気質を持つ同志。" : `${tongbianStar(myFp.day.stem, otherFp.day.stem)}の関係。`}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
