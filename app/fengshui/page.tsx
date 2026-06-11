"use client";

// 風水 — 本人の本命卦 (乾・西四命) と8方位の吉凶を開いた瞬間に表示。
// 任意の生年月日・性別での算出も併設。
// ⚠ 本人の卦は OWNER.natal.fengshui.kua = 6 (確定値) を使う。
//   標準算式 calcKua では 7 になるが、サイト全コンテンツは 6 前提 (owner.ts の注記参照)。

import { useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  calcKua,
  dirRatings,
  annualDirection,
  KUA_NAMES,
  RATING_TEXT,
  type Gender,
} from "@/lib/fengshui";

function DirGrid({ ratings }: { ratings: ReturnType<typeof dirRatings> }) {
  // 8方位を方位盤の並びで表示 (北を下にする家相式ではなく、北上の地図式)
  const byDir = Object.fromEntries(ratings.map((r) => [r.dir, r]));
  const layout: (string | null)[][] = [
    ["西北", "北", "東北"],
    ["西", null, "東"],
    ["西南", "南", "東南"],
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5 max-w-md">
      {layout.flat().map((dir, i) =>
        dir === null ? (
          <div key={i} className="border border-current border-dashed flex items-center justify-center aspect-square opacity-40">
            <span className="editorial-mono text-[9px]">中央</span>
          </div>
        ) : (
          <div
            key={i}
            className={`border-2 border-current p-2 aspect-square flex flex-col items-center justify-center text-center ${byDir[dir].kind === "吉" ? "tab-btn-active" : ""}`}
          >
            <div className="editorial-display-jp text-lg leading-none">{dir}</div>
            <div className="editorial-mono text-[9px] mt-1">{byDir[dir].rating}</div>
            <div className="editorial-mono text-[8px] opacity-70">{byDir[dir].kind}</div>
          </div>
        )
      )}
    </div>
  );
}

export default function FengShuiPage() {
  const year = new Date().getFullYear();

  // 本人: 確定値 kua=6 (乾)
  const myKua = OWNER.natal.fengshui.kua;
  const myRatings = useMemo(() => dirRatings(myKua), [myKua]);
  const annual = useMemo(() => annualDirection(year), [year]);

  // 任意の相手
  const [otherBirth, setOtherBirth] = useState("");
  const [otherGender, setOtherGender] = useState<Gender>("male");
  const other = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    const [y, m, d] = otherBirth.split("-").map(Number);
    const kua = calcKua(y, m, d, otherGender);
    return { kua, ratings: dirRatings(kua) };
  }, [otherBirth, otherGender]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Feng Shui</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">風水</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          KUA {myKua}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          本命卦は{KUA_NAMES[myKua].name} ({KUA_NAMES[myKua].group}) ── 方位が、毎日の運気を変える。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          現住所: {OWNER.residence.pref}{OWNER.residence.city} ({OWNER.residence.floor}F・高層陽宅)。
          ※ 本命卦 6 はサイト確定値 (標準算式では 7・同じ西四命)。
        </p>
      </header>

      {/* 8方位 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">あなたの8方位 ／ Eight Directions</div>
        <div className="grid lg:grid-cols-2 gap-6">
          <DirGrid ratings={myRatings} />
          <div className="space-y-2">
            {myRatings.map((r) => (
              <div key={r.dir} className="flex gap-3 text-sm leading-relaxed">
                <span className={`editorial-chip text-[9px] flex-shrink-0 ${r.kind === "吉" ? "editorial-chip-dark" : ""}`}>
                  {r.dir} {r.rating}
                </span>
                <span className="text-xs opacity-85 pt-0.5">{RATING_TEXT[r.rating]}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="editorial-mono text-[9px] opacity-50 mt-5">
          反転表示 = 吉方位。寝室・デスクは生気/天医へ、絶命/五鬼には長居しない。部屋別の詳細はホームの「住まい」関連カードへ。
        </p>
      </section>

      {/* 年盤 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">{year}年の年盤 ／ Annual</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border-2 border-current p-3">
            <div className="editorial-mono text-[10px] opacity-60">中宮</div>
            <div className="editorial-display-jp text-lg mt-1 leading-tight">{annual.starName}</div>
          </div>
          {([["歳破", annual.saiha], ["五黄殺", annual.gokou], ["暗剣殺", annual.anken]] as const).map(([label, dir]) => (
            <div key={label} className="border-2 border-current p-3">
              <div className="editorial-mono text-[10px] opacity-60">{label} (凶方位)</div>
              <div className="editorial-display-jp text-2xl mt-1">{dir}</div>
            </div>
          ))}
        </div>
        <p className="text-xs opacity-70 mt-4 leading-relaxed">
          今年の凶方位への引越し・長期滞在・大きな契約は避けるのが定石。本命卦の吉方位と重ねて判断する。
        </p>
      </section>

      {/* 任意の相手 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">他の人の本命卦 ／ Lookup</div>
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
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setOtherGender(g)}
                className={`tab-btn border-2 border-current px-4 py-3 editorial-display-jp text-base min-h-[44px] ${otherGender === g ? "tab-btn-active" : ""}`}
              >
                {g === "male" ? "男性" : "女性"}
              </button>
            ))}
          </div>
        </div>
        {other && (
          <div className="mt-6">
            <div className="flex items-baseline gap-3 flex-wrap mb-4">
              <span className="editorial-display text-5xl">KUA {other.kua}</span>
              <span className="editorial-display-jp text-xl">{KUA_NAMES[other.kua].name} ({KUA_NAMES[other.kua].group})</span>
              <span className="editorial-mono text-[10px] opacity-70">
                {KUA_NAMES[other.kua].group === KUA_NAMES[myKua].group ? "★ あなたと同じグループ — 吉方位が一致" : "あなたと異なるグループ — 吉方位が逆"}
              </span>
            </div>
            <DirGrid ratings={other.ratings} />
          </div>
        )}
      </section>
    </div>
  );
}
