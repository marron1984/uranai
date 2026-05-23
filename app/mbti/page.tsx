"use client";

import { useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  MBTI_PROFILES,
  MBTI_DIVINATION_INTEGRATION,
  COGNITIVE_FUNCTION_NAMES,
  AXIS_EXPLAIN,
  compatibility,
  type MbtiType,
} from "@/lib/mbti";

const TYPE_ORDER: MbtiType[] = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const GROUP_LABEL: Record<string, string> = {
  分析家: "Analysts",
  外交官: "Diplomats",
  番人: "Sentinels",
  探検家: "Explorers",
};

export default function MbtiPage() {
  const ownerType = OWNER.natal.mbti;
  const [selected, setSelected] = useState<MbtiType>(ownerType);
  const profile = MBTI_PROFILES[selected];
  const integration = MBTI_DIVINATION_INTEGRATION[selected];

  // 比較対象 = 妻と子 (誕生日から推測する MBTI は無いため、ユーザーが手動で選べる)
  const [spouseType, setSpouseType] = useState<MbtiType>("ENFP");
  const [childType, setChildType] = useState<MbtiType>("ENFJ");

  const spouseCompat = useMemo(() => compatibility(ownerType, spouseType), [ownerType, spouseType]);
  const childCompat = useMemo(() => compatibility(ownerType, childType), [ownerType, childType]);

  // 自分タイプ vs 選択タイプ
  const selectedCompat = useMemo(() => compatibility(ownerType, selected), [ownerType, selected]);

  return (
    <div className="space-y-12">
      {/* ヘッダー */}
      <header>
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">MBTI · 16タイプ性格分析</div>
        <h1 className="font-display text-4xl mt-2 glow-copper">人格の型 — 認知機能で読み解く魂の構造</h1>
        <p className="text-sm text-sand-300 mt-3 leading-relaxed max-w-3xl">
          MBTI (Myers-Briggs Type Indicator) は 4 軸 × 16 タイプの性格分類モデル。
          ユング心理学の認知機能 (Ni/Ne/Si/Se/Ti/Te/Fi/Fe) を組み合わせ、思考と行動の傾向を読み解きます。
          四柱推命・数秘術・タロットと組み合わせると、性格傾向を多面的に確認できます。
        </p>
      </header>

      {/* オーナーの結論 — INFJ */}
      <section className="rounded-2xl border border-copper-500/30 bg-midnight-800/50 backdrop-blur-sm p-8">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">Owner's Type</div>
            <h2 className="font-display text-3xl mt-1">
              {ownerType} <span className="text-copper-200">— {MBTI_PROFILES[ownerType].name}</span>
            </h2>
            <p className="text-sm text-sand-300 mt-1">{MBTI_PROFILES[ownerType].nickname}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-sand-400">人口の {MBTI_PROFILES[ownerType].populationRate}</div>
            <div className="text-[10px] text-sand-500 tracking-wider mt-1">{MBTI_PROFILES[ownerType].group}</div>
          </div>
        </div>
        <p className="text-sand-200 leading-relaxed">{MBTI_PROFILES[ownerType].description}</p>

        {/* 占いとの統合 */}
        <div className="mt-6 pt-6 border-t border-copper-500/20">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">命式 × 数秘 × タロット との響き合い</div>
          <ul className="space-y-2.5">
            {MBTI_DIVINATION_INTEGRATION[ownerType].map((line, i) => (
              <li key={i} className="text-sm text-sand-200 leading-relaxed pl-4 border-l-2 border-copper-500/40">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* タイプセレクター: 16タイプを切り替えて見る */}
      <section>
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300 mb-3">16タイプを探索する</div>
        <div className="grid grid-cols-4 gap-2">
          {TYPE_ORDER.map((t) => {
            const p = MBTI_PROFILES[t];
            const isOwner = t === ownerType;
            const isSelected = t === selected;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelected(t)}
                className={`rounded-lg border px-3 py-3 text-left transition-all ${
                  isSelected
                    ? "border-copper-400 bg-copper-500/15 shadow-lg shadow-copper-500/20"
                    : "border-copper-500/15 bg-midnight-800/40 hover:border-copper-500/40 hover:bg-midnight-800/60"
                }`}
                style={{ borderTopColor: p.groupColor, borderTopWidth: 2 }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-lg tracking-wider">{t}</span>
                  {isOwner && <span className="text-[9px] text-copper-300">★</span>}
                </div>
                <div className="text-[11px] text-sand-300 mt-1">{p.name}</div>
                <div className="text-[9px] text-sand-500 mt-0.5">{p.populationRate}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 選択中のタイプ詳細 */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">{GROUP_LABEL[profile.group]}</div>
            <h2 className="font-display text-3xl mt-1">
              {selected} — {profile.name}
            </h2>
            <p className="text-sm text-sand-300 italic mt-1">"{profile.nickname}"</p>
          </div>
          {selected !== ownerType && (
            <div
              className={`text-xs px-3 py-1.5 rounded-full border ${
                selectedCompat.level === "best"
                  ? "border-green-400/40 text-green-300 bg-green-500/10"
                  : selectedCompat.level === "good"
                  ? "border-blue-400/40 text-blue-300 bg-blue-500/10"
                  : selectedCompat.level === "challenging"
                  ? "border-orange-400/40 text-orange-300 bg-orange-500/10"
                  : "border-sand-500/30 text-sand-400"
              }`}
            >
              {ownerType} との相性: {selectedCompat.level === "best" ? "最高" : selectedCompat.level === "good" ? "良好" : selectedCompat.level === "challenging" ? "学びの相性" : "中立"}
            </div>
          )}
        </div>

        <p className="text-sand-200 leading-relaxed">{profile.description}</p>

        {/* 4軸 */}
        <div className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-4">4軸のバランス</div>
          <div className="space-y-4">
            {(["E/I", "S/N", "T/F", "J/P"] as const).map((axis) => {
              const ax = AXIS_EXPLAIN[axis];
              const val = axis === "E/I" ? profile.axes.ei : axis === "S/N" ? profile.axes.sn : axis === "T/F" ? profile.axes.tf : profile.axes.jp;
              return (
                <div key={axis}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={val < 50 ? "text-copper-300 font-medium" : "text-sand-400"}>{ax.left}</span>
                    <span className={val >= 50 ? "text-copper-300 font-medium" : "text-sand-400"}>{ax.right}</span>
                  </div>
                  <div className="h-2 bg-midnight-900/60 rounded-full overflow-hidden relative">
                    <div
                      className="absolute top-0 h-full bg-gradient-to-r from-copper-500 to-copper-300"
                      style={{ left: val < 50 ? `${val}%` : "50%", width: `${val < 50 ? 50 - val : val - 50}%` }}
                    />
                    <div className="absolute top-0 left-1/2 w-px h-full bg-sand-500/30" />
                  </div>
                  <p className="text-[10px] text-sand-500 mt-1.5">{ax.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 認知機能スタック */}
        <div className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-4">認知機能のスタック</div>
          <p className="text-xs text-sand-400 mb-4">
            ユング心理学が示す 8 つの認知機能のうち、{selected} が優先的に使う 4 つ。
            上から優位機能 → 補助機能 → 第三機能 → 劣等機能。
          </p>
          <div className="space-y-3">
            {([
              ["優位機能 (Dominant)", profile.cognitive.dominant, "あなたを最も活かす機能"],
              ["補助機能 (Auxiliary)", profile.cognitive.auxiliary, "優位機能を支える得意な機能"],
              ["第三機能 (Tertiary)", profile.cognitive.tertiary, "成長と共に磨かれる中位の機能"],
              ["劣等機能 (Inferior)", profile.cognitive.inferior, "弱点・成長の最大の鍵・ストレス時に暴走する機能"],
            ] as const).map(([label, fn, hint], i) => {
              const info = COGNITIVE_FUNCTION_NAMES[fn];
              return (
                <div key={fn} className="flex items-start gap-4 p-3 rounded-lg bg-midnight-900/40">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg border border-copper-500/40 flex items-center justify-center font-display text-xl">
                    {fn}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between flex-wrap gap-2">
                      <span className="text-sm text-copper-300">{label}</span>
                      <span className="text-[10px] text-sand-500">{info.full}</span>
                    </div>
                    <p className="text-xs text-sand-300 leading-relaxed mt-1">{info.description}</p>
                    <p className="text-[10px] text-sand-500 mt-1 italic">{hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 強み・弱み */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-500/25 p-5 bg-green-950/15">
            <div className="text-[10px] tracking-[0.3em] uppercase text-green-300 mb-3">強み (Strengths)</div>
            <ul className="space-y-1.5">
              {profile.strengths.map((s) => (
                <li key={s} className="text-sm text-sand-200 leading-relaxed">・{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-orange-500/25 p-5 bg-orange-950/15">
            <div className="text-[10px] tracking-[0.3em] uppercase text-orange-300 mb-3">弱み (Weaknesses)</div>
            <ul className="space-y-1.5">
              {profile.weaknesses.map((w) => (
                <li key={w} className="text-sm text-sand-200 leading-relaxed">・{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 仕事・恋愛・親としての傾向 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">向いている職業</div>
            <ul className="space-y-1">
              {profile.careers.map((c) => (
                <li key={c} className="text-xs text-sand-200">・{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">恋愛・パートナー</div>
            <p className="text-xs text-sand-200 leading-relaxed">{profile.loveStyle}</p>
          </div>
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">親としての傾向</div>
            <p className="text-xs text-sand-200 leading-relaxed">{profile.parentingStyle}</p>
          </div>
        </div>

        {/* ストレス・成長・影 */}
        <div className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-4">魂の鍛錬 — ストレス・成長・影</div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-copper-300 mb-1.5">ストレスを感じる状況</div>
              <div className="flex flex-wrap gap-2">
                {profile.stressors.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-midnight-900/60 border border-copper-500/25 text-sand-300">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-copper-300 mb-1.5">成長の方向性</div>
              <p className="text-sm text-sand-200 leading-relaxed">{profile.growthPath}</p>
            </div>
            <div>
              <div className="text-sm text-copper-300 mb-1.5">影 (シャドウ) — ストレス時の暴走パターン</div>
              <p className="text-sm text-sand-200 leading-relaxed">{profile.shadow}</p>
            </div>
          </div>
        </div>

        {/* 有名人例 */}
        <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">同じタイプの著名人</div>
          <div className="flex flex-wrap gap-2">
            {profile.famousPeople.map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-full border border-copper-500/20 text-sand-300">{p}</span>
            ))}
          </div>
        </div>

        {/* 相性 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">最高の相性</div>
            <div className="flex flex-wrap gap-2">
              {profile.bestMatch.map((t) => (
                <button key={t} onClick={() => setSelected(t)} className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/40 text-green-200 hover:bg-green-500/25 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">良好な相性</div>
            <div className="flex flex-wrap gap-2">
              {profile.goodMatch.map((t) => (
                <button key={t} onClick={() => setSelected(t)} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-200 hover:bg-blue-500/25 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-800/50">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">学びの相性 (チャレンジ)</div>
            <div className="flex flex-wrap gap-2">
              {profile.challenging.map((t) => (
                <button key={t} onClick={() => setSelected(t)} className="text-xs px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/40 text-orange-200 hover:bg-orange-500/25 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 家族との相性: 妻・子の MBTI を選択して相性を確認 */}
      <section className="rounded-2xl border border-copper-500/30 bg-midnight-800/50 backdrop-blur-sm p-8">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300 mb-2">家族との相性をシミュレーション</div>
        <h2 className="font-display text-2xl">家族の MBTI を選んで、相性を確認</h2>
        <p className="text-xs text-sand-400 mt-2 mb-6">
          MBTI は生年月日からは算出できないため、ご家族には簡易テストを受けてもらうか、観察に基づいて推定する必要があります。
          以下は仮設定で、選択した型に応じて相性が変わります。
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 妻 */}
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-900/40">
            <div className="text-sm text-copper-300 mb-3">妻 (1969-12-21・射手座)</div>
            <select
              value={spouseType}
              onChange={(e) => setSpouseType(e.target.value as MbtiType)}
              className="w-full bg-midnight-900 border border-copper-500/30 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-copper-400"
            >
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>{t} — {MBTI_PROFILES[t].name}</option>
              ))}
            </select>
            <div className={`text-xs px-3 py-2 rounded-lg ${
              spouseCompat.level === "best" ? "bg-green-500/15 text-green-200 border border-green-500/40"
              : spouseCompat.level === "good" ? "bg-blue-500/15 text-blue-200 border border-blue-500/40"
              : spouseCompat.level === "challenging" ? "bg-orange-500/15 text-orange-200 border border-orange-500/40"
              : "bg-sand-500/10 text-sand-300 border border-sand-500/30"
            }`}>
              <div className="font-medium mb-1">
                {ownerType} × {spouseType}: {spouseCompat.level === "best" ? "最高の相性" : spouseCompat.level === "good" ? "良好な相性" : spouseCompat.level === "challenging" ? "学びの相性" : "中立な相性"}
              </div>
              <div className="leading-relaxed">{spouseCompat.reason}</div>
            </div>
          </div>

          {/* 子 */}
          <div className="rounded-xl border border-copper-500/20 p-5 bg-midnight-900/40">
            <div className="text-sm text-copper-300 mb-3">子 (2011-11-03・蠍座)</div>
            <select
              value={childType}
              onChange={(e) => setChildType(e.target.value as MbtiType)}
              className="w-full bg-midnight-900 border border-copper-500/30 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-copper-400"
            >
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>{t} — {MBTI_PROFILES[t].name}</option>
              ))}
            </select>
            <div className={`text-xs px-3 py-2 rounded-lg ${
              childCompat.level === "best" ? "bg-green-500/15 text-green-200 border border-green-500/40"
              : childCompat.level === "good" ? "bg-blue-500/15 text-blue-200 border border-blue-500/40"
              : childCompat.level === "challenging" ? "bg-orange-500/15 text-orange-200 border border-orange-500/40"
              : "bg-sand-500/10 text-sand-300 border border-sand-500/30"
            }`}>
              <div className="font-medium mb-1">
                {ownerType} × {childType}: {childCompat.level === "best" ? "最高の相性" : childCompat.level === "good" ? "良好な相性" : childCompat.level === "challenging" ? "学びの相性" : "中立な相性"}
              </div>
              <div className="leading-relaxed">{childCompat.reason}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 自己診断への誘導 */}
      <section className="rounded-2xl border border-copper-500/20 bg-midnight-800/40 p-6">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300 mb-2">MBTI 診断について</div>
        <p className="text-sm text-sand-300 leading-relaxed">
          本ページでは、しゅんすけさんの命式・数秘・タロットから推定される型 ({ownerType}) を初期値としています。
          正式な診断を受けたい場合は <span className="text-copper-300">16Personalities</span> や
          <span className="text-copper-300"> MBTI 公式 (Myers-Briggs Foundation)</span> のテストを受けてください。
          結果は時期・心境によって多少前後しますが、認知機能スタックは生涯ほぼ一定とされています。
        </p>
      </section>
    </div>
  );
}
