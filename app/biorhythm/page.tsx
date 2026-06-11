"use client";

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  CYCLES,
  PRIMARY_CYCLES,
  biorhythm,
  series,
  upcomingCriticalDays,
  bioCompat,
  type SeriesPoint,
  type CycleDef,
} from "@/lib/biorhythm";

const WJP = ["日", "月", "火", "水", "木", "金", "土"];
function fmt(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}(${WJP[d.getDay()]})`;
}

// ── 折れ線グラフ (SVG) ──────────────────────────────────────────
const W = 680;
const H = 230;
const PAD_L = 8;
const PAD_R = 8;
const PAD_Y = 18;

function Chart({ pts, cycles, todayOffset }: { pts: SeriesPoint[]; cycles: CycleDef[]; todayOffset: number }) {
  const n = pts.length;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_Y * 2;
  const x = (i: number) => PAD_L + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD_Y + (1 - v) * (plotH / 2); // v: -1..1
  const todayIdx = pts.findIndex((p) => p.offset === todayOffset);
  const todayX = x(todayIdx);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ display: "block" }}>
      {/* グリッド */}
      <line x1={PAD_L} y1={y(0)} x2={W - PAD_R} y2={y(0)} stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1={PAD_L} y1={y(1)} x2={W - PAD_R} y2={y(1)} stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <line x1={PAD_L} y1={y(-1)} x2={W - PAD_R} y2={y(-1)} stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {/* 今日の縦線 */}
      <line x1={todayX} y1={PAD_Y} x2={todayX} y2={H - PAD_Y} stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      <text x={todayX} y={12} textAnchor="middle" fontSize="9" fill="currentColor" className="editorial-mono">TODAY</text>
      {/* 各リズム */}
      {cycles.map((c) => (
        <polyline
          key={c.key}
          fill="none"
          stroke={c.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts.map((p, i) => `${x(i)},${y(p[c.key])}`).join(" ")}
        />
      ))}
      {/* 今日の各点 */}
      {cycles.map((c) => (
        <circle key={c.key + "-dot"} cx={todayX} cy={y(pts[todayIdx][c.key])} r="3.5" fill={c.color} stroke="var(--background)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.abs(value);
  const up = value >= 0;
  return (
    <div className="relative h-2 w-full border border-current bg-transparent overflow-hidden">
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-current opacity-40" />
      <div
        className="absolute top-0 bottom-0"
        style={{
          background: color,
          width: `${pct / 2}%`,
          left: up ? "50%" : `${50 - pct / 2}%`,
        }}
      />
    </div>
  );
}

export default function BiorhythmPage() {
  const [today, setToday] = useState<Date | null>(null);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => setToday(new Date()), []);

  const result = useMemo(() => (today ? biorhythm(OWNER.birth, today) : null), [today]);
  const pts = useMemo(() => (today ? series(OWNER.birth, today, 15, 15) : []), [today]);
  const criticals = useMemo(() => (today ? upcomingCriticalDays(OWNER.birth, today, 30) : []), [today]);

  const chartCycles = showAll ? CYCLES : PRIMARY_CYCLES;

  const wifeCompat = useMemo(() => bioCompat(OWNER.birth, OWNER.family.spouse.birth), []);
  const childCompat = useMemo(() => bioCompat(OWNER.birth, OWNER.family.child.birth), []);

  const [otherBirth, setOtherBirth] = useState("");
  const otherCompat = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    try { return bioCompat(OWNER.birth, otherBirth); } catch { return null; }
  }, [otherBirth]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Biorhythm</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">バイオリズム</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          RHYTHM
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          生まれた日から、波は止まらない。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          出生からの経過日数を周期 23・28・33 日の正弦波に通して身体・感情・知性の波を算出。
          表を使わない純粋な数式で、誰が計算しても同じ値になる決定論的占断。
        </p>
      </header>

      {result && (
        <>
          {/* 今日の総合 */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今日の波 ／ Today</div>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="editorial-display text-6xl sm:text-7xl leading-none">
                {result.composite > 0 ? "+" : ""}{result.composite}
              </div>
              <div className="editorial-mono text-[10px] opacity-60 pb-2">
                総合指数 (3 リズム平均)<br />出生から {result.days.toLocaleString()} 日目
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {result.primary.map((s) => (
                <div key={s.def.key} className="border-2 border-current p-4">
                  <div className="flex items-center justify-between">
                    <span className="editorial-display-jp text-xl flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border border-current" style={{ background: s.def.color }} />
                      {s.def.name}
                    </span>
                    <span className="editorial-mono text-[10px] opacity-60">{s.def.period}日</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="editorial-display text-3xl">{s.value > 0 ? "+" : ""}{s.value}</span>
                    <span className="editorial-chip text-[9px]">{s.critical ? "要注意" : s.level}</span>
                    <span className="editorial-mono text-[9px] opacity-50">{s.phase}</span>
                  </div>
                  <div className="mt-2"><Bar value={s.value} color={s.def.color} /></div>
                  <p className="text-xs leading-relaxed mt-3 opacity-90">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* グラフ */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="editorial-chip text-[10px] sm:text-xs">前後 15 日の波 ／ Chart</div>
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="editorial-mono text-[10px] border border-current px-3 py-1.5 min-h-[36px]"
              >
                {showAll ? "古典 3 リズムのみ" : "拡張 7 リズム表示"}
              </button>
            </div>
            <Chart pts={pts} cycles={chartCycles} todayOffset={0} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {chartCycles.map((c) => (
                <span key={c.key} className="editorial-mono text-[9px] flex items-center gap-1.5">
                  <span className="inline-block w-3 h-1.5" style={{ background: c.color }} />
                  {c.name} ({c.period}日)
                </span>
              ))}
            </div>
          </section>

          {/* 拡張リズム (showAll の時のみ詳細) */}
          {showAll && (
            <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
              <div className="editorial-chip mb-4 text-[10px] sm:text-xs">拡張リズム ／ Extended</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.cycles.filter((s) => !s.def.primary).map((s) => (
                  <div key={s.def.key} className="border-2 border-current p-3">
                    <div className="flex items-center justify-between">
                      <span className="editorial-display-jp text-base flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 border border-current" style={{ background: s.def.color }} />
                        {s.def.name}<span className="editorial-mono text-[9px] opacity-50">{s.def.enName}</span>
                      </span>
                      <span className="editorial-display text-xl">{s.value > 0 ? "+" : ""}{s.value}</span>
                    </div>
                    <div className="mt-1.5"><Bar value={s.value} color={s.def.color} /></div>
                    <p className="text-[11px] leading-relaxed mt-2 opacity-80">{s.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 要注意日 */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今後 30 日の要注意日 ／ Critical Days</div>
            {criticals.length === 0 ? (
              <p className="text-sm opacity-70">向こう 30 日に大きなゼロ通過はありません。安定した波が続きます。</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {criticals.map((c) => (
                  <div key={c.offset} className="border-2 border-current p-3">
                    <div className="editorial-display-jp text-lg">{fmt(c.date)}</div>
                    <div className="editorial-mono text-[9px] opacity-60 mt-0.5">
                      {c.offset === 0 ? "今日" : `${c.offset}日後`}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.cycles.map((name) => {
                        const def = PRIMARY_CYCLES.find((d) => d.name === name)!;
                        return (
                          <span key={name} className="editorial-mono text-[9px] flex items-center gap-1">
                            <span className="inline-block w-2 h-2" style={{ background: def.color }} />{name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="editorial-mono text-[9px] opacity-50 mt-4">
              要注意日 = リズムがゼロ線を横切る不安定日。能力が低いのではなく「切り替わりで揺らぐ」日。
            </p>
          </section>

          {/* 家族との相性 */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="editorial-chip mb-4 text-[10px] sm:text-xs">家族とのリズム相性 ／ Sync</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {([["妻", wifeCompat], ["子", childCompat]] as const).map(([label, comp]) => (
                <div key={label} className="border-2 border-current p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="editorial-display-jp text-2xl">{label}</span>
                    <span className="editorial-display text-3xl">{comp.overall > 0 ? "+" : ""}{comp.overall}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {comp.cycles.filter((c) => c.def.primary).map((c) => (
                      <span key={c.def.key} className="editorial-mono text-[9px] flex items-center gap-1">
                        <span className="inline-block w-2 h-2" style={{ background: c.def.color }} />
                        {c.def.name} {c.sync > 0 ? "+" : ""}{c.sync}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed mt-3 opacity-90">{comp.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 任意の相手 */}
          <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
            <div className="editorial-chip mb-4 text-[10px] sm:text-xs">相性を調べる ／ Compatibility</div>
            <label className="block max-w-xs">
              <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 相手の生年月日</span>
              <input
                type="date"
                value={otherBirth}
                onChange={(e) => setOtherBirth(e.target.value)}
                className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
              />
            </label>
            {otherCompat && (
              <div className="mt-5 border-2 border-current p-4">
                <div className="flex items-baseline justify-between">
                  <span className="editorial-display-jp text-xl">リズム同調度</span>
                  <span className="editorial-display text-4xl">{otherCompat.overall > 0 ? "+" : ""}{otherCompat.overall}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {otherCompat.cycles.filter((c) => c.def.primary).map((c) => (
                    <span key={c.def.key} className="editorial-mono text-[9px] flex items-center gap-1">
                      <span className="inline-block w-2 h-2" style={{ background: c.def.color }} />
                      {c.def.name} {c.sync > 0 ? "+" : ""}{c.sync}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mt-3">{otherCompat.text}</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
