"use client";

// 家族の『今日』 — 妻・子それぞれの今日のバイオリズム同調度・パーソナルデイ・
// 宿曜の日々の関係・マヤKINの関係を日替わりで提示する。
// すべて生年月日からの決定論的算出 (同じ日は同じ結果)。

import { useEffect, useMemo, useState } from "react";
import { OWNER, ownerAge, spouseAge, childAge, childDisplayName } from "@/lib/owner";
import { biorhythm, bioCompat } from "@/lib/biorhythm";
import { personalDay, personalDayText } from "@/lib/today";
import { birthMansion, todayMansion, dailyRelation } from "@/lib/sukuyo";
import { kinFromDate, todayKin, kinCompat } from "@/lib/maya";

const WJP = ["日", "月", "火", "水", "木", "金", "土"];
function fmt(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WJP[d.getDay()]})`;
}

const KIND_CHIP: Record<string, string> = {
  大吉: "editorial-chip-dark", 吉: "", 中: "", 注意: "", 凶: "",
};

type Member = {
  key: "self" | "spouse" | "child";
  label: string;
  birth: string;
  age: number;
};

function MemberCard({ m, date, advice }: { m: Member; date: Date; advice: string }) {
  // バイオリズム (本人) — 3 リズム
  const bio = useMemo(() => biorhythm(m.birth, date), [m.birth, date]);
  // パーソナルデイ
  const [y, mo, d] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  const pd = useMemo(() => personalDay(m.birth, y, mo, d), [m.birth, y, mo, d]);
  const pdText = personalDayText(pd, date);
  // 宿曜 日々の関係
  const rel = useMemo(() => dailyRelation(birthMansion(m.birth), todayMansion(date)), [m.birth, date]);
  // 本人との関係 (self は除く)
  const compat = useMemo(() => (m.key === "self" ? null : bioCompat(OWNER.birth, m.birth)), [m.birth, m.key]);
  const kinRel = useMemo(
    () => (m.key === "self" ? null : kinCompat(kinFromDate(OWNER.birth), kinFromDate(m.birth))),
    [m.birth, m.key]
  );

  return (
    <div className="border border-current p-5 sm:p-6" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="flex items-baseline justify-between flex-wrap gap-2 border-b border-current pb-3">
        <span className="editorial-display-jp text-2xl sm:text-3xl">{m.label}</span>
        <span className="editorial-mono text-[10px] opacity-60">{m.age}歳 ／ {m.birth}</span>
      </div>

      {/* バイオリズム 3 本 */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {bio.primary.map((s) => (
          <div key={s.def.key} className="border-2 border-current p-2 text-center">
            <div className="editorial-mono text-[9px] opacity-60">{s.def.name}</div>
            <div className="editorial-display text-2xl leading-none mt-1" style={{ color: s.def.color }}>
              {s.value > 0 ? "+" : ""}{s.value}
            </div>
            <div className="editorial-mono text-[8px] mt-0.5">{s.critical ? "要注意" : s.level}</div>
          </div>
        ))}
      </div>
      <div className="editorial-mono text-[9px] opacity-50 mt-1.5 text-center">
        総合 {bio.composite > 0 ? "+" : ""}{bio.composite}
      </div>

      {/* パーソナルデイ + 宿曜 */}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="border-l-4 border-current pl-3">
          <div className="editorial-mono text-[10px] opacity-60">パーソナルデイ {pd}</div>
          <p className="text-xs leading-relaxed mt-1 opacity-85">{pdText.energy}</p>
        </div>
        <div className="border-l-4 border-current pl-3">
          <div className="editorial-mono text-[10px] opacity-60 flex items-center gap-1.5">
            宿曜 日々の関係
            <span className={`editorial-chip text-[8px] ${KIND_CHIP[rel.kind] ?? ""}`}>{rel.name}・{rel.kind}</span>
          </div>
          <p className="text-xs leading-relaxed mt-1 opacity-85">{rel.meaning}</p>
        </div>
      </div>

      {/* 本人との関係 */}
      {compat && kinRel && (
        <div className="mt-4 border-t border-current pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="editorial-mono text-[10px] opacity-60">あなたとのリズム同調度</span>
            <span className="editorial-display text-xl">{compat.overall > 0 ? "+" : ""}{compat.overall}</span>
            <span className="editorial-chip text-[9px]">マヤ {kinRel.level}</span>
          </div>
          <p className="text-xs leading-relaxed mt-1.5 opacity-85">{compat.text}</p>
        </div>
      )}

      {/* 今日の関わり方アドバイス */}
      <div className="mt-4 border-2 border-current p-3" style={{ background: "var(--background)" }}>
        <div className="editorial-mono text-[10px] opacity-60 mb-1">今日の関わり方</div>
        <p className="text-sm leading-relaxed">{advice}</p>
      </div>
    </div>
  );
}

// 本人と相手のバイオリズム/PD/宿曜から、今日の関わり方を決定論的に組み立てる
function buildAdvice(date: Date, selfBirth: string, otherBirth: string, label: string): string {
  const sb = biorhythm(selfBirth, date);
  const ob = biorhythm(otherBirth, date);
  const rel = dailyRelation(birthMansion(otherBirth), todayMansion(date));
  const emo = ob.primary.find((c) => c.def.key === "emotional")!;
  const phy = ob.primary.find((c) => c.def.key === "physical")!;

  const parts: string[] = [];
  // 相手の感情リズム
  if (emo.critical) parts.push(`${label}は感情の要注意日。気分の波が大きいので、議論や指摘は避け、ただ話を聴く側に回ると吉。`);
  else if (emo.value <= -30) parts.push(`${label}は感情が低調気味。励ましより、そっと寄り添い負担を一つ引き受けると安心する。`);
  else if (emo.value >= 30) parts.push(`${label}は感情が高調。前向きな相談・お願い事・楽しい計画を持ちかけるのに良い日。`);
  // 相手の身体リズム
  if (phy.critical || phy.value <= -30) parts.push(`体力は下り坂。無理をさせず、家事や予定を軽くしてあげると良い。`);
  // 宿曜の関係
  if (rel.kind === "大吉" || rel.kind === "吉") parts.push(`宿曜では「${rel.name}」の好日 ─ ${label}との関わりが幸運を呼ぶ。`);
  else if (rel.kind === "凶" || rel.kind === "注意") parts.push(`宿曜は「${rel.name}」。すれ違いやすいので、言葉を一つ丁寧に。`);
  // 自分が低い日の注意
  const selfEmo = sb.primary.find((c) => c.def.key === "emotional")!;
  if (selfEmo.value <= -30 || selfEmo.critical) parts.push(`あなた自身も感情が下り坂。自分が余裕のない日だと自覚して、当たらないよう一呼吸。`);

  return parts.length > 0 ? parts.join(" ") : `今日は穏やかな巡り。特別な配慮は不要、いつも通りの自然な関わりで十分良い一日になる。`;
}

export default function FamilyPage() {
  const [date, setDate] = useState<Date | null>(null);
  useEffect(() => setDate(new Date()), []);

  const [offset, setOffset] = useState(0);
  const target = useMemo(() => {
    const base = date ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
  }, [date, offset]);

  const members: Member[] = useMemo(() => {
    if (!date) return [];
    return [
      { key: "self", label: "あなた", birth: OWNER.birth, age: ownerAge(target) },
      { key: "spouse", label: "妻", birth: OWNER.family.spouse.birth, age: spouseAge(target) },
      { key: "child", label: childDisplayName(target), birth: OWNER.family.child.birth, age: childAge(target) },
    ];
  }, [date, target]);

  const todayKinResult = useMemo(() => (date ? todayKin(target) : null), [date, target]);

  if (!date) return <div className="editorial-mono text-xs opacity-50">…</div>;

  return (
    <div className="space-y-8">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Family Today</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">家族の今日</span>
        </div>
        <h1 className="editorial-display text-[15vw] sm:text-[10vw] lg:text-[84px] leading-[0.9] uppercase break-words">
          FAMILY
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          今日、家族にどう関わるか。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          妻・子それぞれの今日のバイオリズム・パーソナルデイ・宿曜の関係から、
          日替わりの「関わり方」を提示。すべて生年月日からの決定論的算出。
        </p>
      </header>

      {/* 日付ナビ */}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setOffset((o) => o - 1)} className="tab-btn border-2 border-current px-4 py-2 editorial-mono text-xs min-h-[40px]">← 前日</button>
        <div className="text-center">
          <div className="editorial-display-jp text-lg sm:text-xl">{fmt(target)}</div>
          {offset !== 0 && (
            <button type="button" onClick={() => setOffset(0)} className="editorial-mono text-[10px] underline opacity-70">今日に戻る</button>
          )}
        </div>
        <button type="button" onClick={() => setOffset((o) => o + 1)} className="tab-btn border-2 border-current px-4 py-2 editorial-mono text-xs min-h-[40px]">翌日 →</button>
      </div>

      {/* 今日の家族KIN */}
      {todayKinResult && (
        <div className="border border-current p-4 text-center" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
          <span className="editorial-mono text-[10px] opacity-60">今日のマヤ KIN {todayKinResult.kin} ／ </span>
          <span className="editorial-display-jp text-base">{todayKinResult.tone.name}の{todayKinResult.seal.name}</span>
          <span className="editorial-mono text-[10px] opacity-60"> ─ 家族で過ごす日の全体エネルギー</span>
        </div>
      )}

      {/* メンバーカード */}
      <div className="space-y-5">
        {members.map((m) => (
          <MemberCard
            key={m.key}
            m={m}
            date={target}
            advice={m.key === "self"
              ? `あなたの今日の総合リズムは ${biorhythm(OWNER.birth, target).composite > 0 ? "+" : ""}${biorhythm(OWNER.birth, target).composite}。家族の状態を見て、余裕がある日は支え役に、低調な日は無理せず自分を整えることを優先。`
              : buildAdvice(target, OWNER.birth, m.birth, m.label)}
          />
        ))}
      </div>

      <p className="editorial-mono text-[9px] opacity-50 leading-relaxed">
        ※ バイオリズム同調度 = 二人の出生日差から各リズムの位相差を算出 (+100 完全同調 / -100 逆位相)。
        宿曜の日々の関係は相手の本命宿から見た今日の宿の巡り。
      </p>
    </div>
  );
}
