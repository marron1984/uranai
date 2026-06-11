"use client";

// 暦 (こよみ) — 開運日カレンダー + 九星の日盤・月盤吉方位
// 規則・検証値は 2026-06 のサブエージェント並列リサーチで外部複数ソースと突合済み。

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import { dayTags, rokuyo, upcomingKoyomi, ROKUYO_TEXT, type KoyomiDay } from "@/lib/koyomi";
import { todayDirections, STAR_NAMES, DIRS8, type DirInfo } from "@/lib/kyuseiBoard";

const WJP = ["日", "月", "火", "水", "木", "金", "土"];
function fmt(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}(${WJP[d.getDay()]})`;
}

const KIND_STYLE: Record<string, string> = {
  大吉: "tab-btn-active",
  吉: "",
  凶: "opacity-60 line-through-none",
};

function DirBoard({ dirs, title, center }: { dirs: DirInfo[]; title: string; center: number }) {
  const byDir = Object.fromEntries(dirs.map((x) => [x.dir, x]));
  const layout: (string | null)[][] = [
    ["西北", "北", "東北"],
    ["西", null, "東"],
    ["西南", "南", "東南"],
  ];
  return (
    <div>
      <div className="editorial-mono text-[10px] opacity-60 mb-2">{title} ／ 中宮 {STAR_NAMES[center]}</div>
      <div className="grid grid-cols-3 gap-1 max-w-[280px]">
        {layout.flat().map((dir, i) =>
          dir === null ? (
            <div key={i} className="border border-current border-dashed aspect-square flex items-center justify-center opacity-40">
              <span className="editorial-mono text-[9px]">{STAR_NAMES[center].slice(0, 2)}</span>
            </div>
          ) : (
            <div
              key={i}
              className={`border-2 border-current p-1 aspect-square flex flex-col items-center justify-center text-center ${
                byDir[dir].good ? "tab-btn-active" : ""
              } ${byDir[dir].bad.length > 0 ? "opacity-90" : ""}`}
            >
              <div className="editorial-display-jp text-sm leading-none">{dir}</div>
              <div className="editorial-mono text-[8px] mt-0.5">{byDir[dir].starName.slice(0, 2)}</div>
              {byDir[dir].good && <div className="editorial-mono text-[8px]">吉</div>}
              {byDir[dir].bad.length > 0 && (
                <div className="editorial-mono text-[7px] leading-tight">{byDir[dir].bad.join("・")}</div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function KoyomiPage() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const todayInfo = useMemo(() => (today ? dayTags(today) : null), [today]);
  const todayRokuyo = useMemo(() => (today ? rokuyo(today) : null), [today]);
  const upcoming = useMemo(() => (today ? upcomingKoyomi(today, 45) : []), [today]);
  const dirs = useMemo(
    () => (today ? todayDirections(today, OWNER.natal.kyusei.honmei) : null),
    [today]
  );

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Koyomi</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">暦・開運日</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          KOYOMI
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          いい日を選ぶ。それも、立派な戦略。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          天赦日・一粒万倍日は日干支×節気、六曜は旧暦 (朔と中気から天文計算)、
          方位は九星の日盤・月盤から算出。2026年の暦と複数ソースで突合済み。
        </p>
      </header>

      {todayInfo && today && (
        <>
          {/* 今日の暦注 */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今日の暦 ／ {fmt(today)}</div>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="editorial-display-jp text-5xl sm:text-6xl">{todayRokuyo?.name ?? "—"}</div>
              <div className="editorial-mono text-[10px] opacity-60 pb-1.5">
                {todayInfo.ganzhi}の日
                {todayRokuyo && <> ／ 旧暦 {todayRokuyo.lunar.isLeap ? "閏" : ""}{todayRokuyo.lunar.month}月{todayRokuyo.lunar.day}日</>}
              </div>
            </div>
            {todayRokuyo && (
              <p className="text-sm leading-relaxed mt-3">{ROKUYO_TEXT[todayRokuyo.name]}</p>
            )}
            {todayInfo.tags.length > 0 ? (
              <div className="mt-5 space-y-3">
                {todayInfo.tags.map((t) => (
                  <div key={t.name} className="flex gap-3 items-start">
                    <span className={`editorial-chip text-[10px] flex-shrink-0 ${t.kind === "大吉" ? "editorial-chip-dark" : ""}`}>
                      {t.name}{t.kind === "凶" ? " ⚠" : ""}
                    </span>
                    <span className="text-xs leading-relaxed opacity-85 pt-1">{t.desc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="editorial-mono text-[10px] opacity-50 mt-4">今日は特記の吉日・凶日なし。</p>
            )}
          </section>

          {/* 今日の方位 */}
          {dirs && (
            <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
              <div className="editorial-chip mb-2 text-[10px] sm:text-xs">今日の吉方位 ／ Directions</div>
              <p className="editorial-mono text-[9px] opacity-60 mb-4">
                本命星 {STAR_NAMES[OWNER.natal.kyusei.honmei]} の吉星 = {dirs.luckyStars.map((s) => STAR_NAMES[s].slice(0, 2)).join("・")}。
                反転 = 吉方位 ／ 小字 = 凶殺。日盤は{dirs.day.ton}中。
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                <DirBoard dirs={dirs.day.dirs} title={`日盤 (${dirs.day.ganzhi}日)`} center={dirs.day.center} />
                <DirBoard dirs={dirs.month.dirs} title="月盤" center={dirs.month.center} />
                <DirBoard dirs={dirs.year.dirs} title="年盤" center={dirs.year.center} />
              </div>
              <p className="editorial-mono text-[9px] opacity-50 mt-5 leading-relaxed">
                日盤吉方は散歩・買い物・ランチに ／ 月盤は旅行・出張に ／ 年盤は引越し・長期滞在に。
                五黄殺・暗剣殺・本命殺・本命的殺・破は避ける。
                ※ 日盤の閏遁 (約11年周期の調整) は未実装 — 2030年代は要再確認。
              </p>
            </section>
          )}

          {/* 開運日カレンダー */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今後 45 日の開運日 ／ Lucky Days</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {upcoming.map((k) => {
                const isBest = k.tags.some((t) => t.name === "天赦日");
                const hasBad = k.tags.some((t) => t.kind === "凶");
                const goodTags = k.tags.filter((t) => t.kind !== "凶");
                if (goodTags.length === 0) return null;
                return (
                  <div key={k.date.toISOString()} className={`border-2 border-current p-3 ${isBest ? "tab-btn-active" : ""}`}>
                    <div className="flex items-baseline justify-between">
                      <span className="editorial-display-jp text-lg">{fmt(k.date)}</span>
                      <span className="editorial-mono text-[9px] opacity-60">{k.ganzhi}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {k.tags.map((t) => (
                        <span key={t.name} className={`editorial-mono text-[9px] border border-current px-1.5 py-0.5 ${t.kind === "凶" ? "opacity-50" : ""}`}>
                          {t.kind === "凶" ? "⚠" : ""}{t.name}
                        </span>
                      ))}
                    </div>
                    {isBest && hasBad && (
                      <div className="editorial-mono text-[8px] opacity-70 mt-1">※ 凶日と重なるため吉は半減との説あり</div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="editorial-mono text-[9px] opacity-50 mt-4">
              反転 = 天赦日 (暦上最強の吉日・年5〜6回)。天赦日×一粒万倍日の重なりは最強の開運日。
            </p>
          </section>
        </>
      )}
    </div>
  );
}
