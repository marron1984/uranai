"use client";

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  SOLAR_SEALS,
  kinFromDate,
  todayKin,
  kinCompat,
  type KinResult,
} from "@/lib/maya";

const COLOR_BG: Record<string, string> = {
  赤: "#ff5c5c",
  白: "#f5f5f0",
  青: "#5c9eff",
  黄: "#ffe600",
};

function SealBadge({ kin, label }: { kin: KinResult; label: string }) {
  return (
    <div className="border-2 border-current p-4">
      <div className="editorial-mono text-[10px] opacity-60">{label}</div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className="inline-block w-4 h-4 border-2 border-current flex-shrink-0"
          style={{ background: COLOR_BG[kin.seal.color] }}
        />
        <span className="editorial-display-jp text-xl">{kin.seal.name}</span>
      </div>
      <div className="editorial-mono text-[9px] opacity-60 mt-1">
        KIN {kin.kin} ／ 音 {kin.tone.num} ({kin.tone.name})
      </div>
    </div>
  );
}

export default function MayaPage() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const myKin = useMemo(() => kinFromDate(OWNER.birth), []);
  const tKin = useMemo(() => (today ? todayKin(today) : null), [today]);

  const wifeKin = useMemo(() => kinFromDate(OWNER.family.spouse.birth), []);
  const childKin = useMemo(() => kinFromDate(OWNER.family.child.birth), []);

  // 任意の相手
  const [otherBirth, setOtherBirth] = useState("");
  const otherKin = useMemo<KinResult | null>(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    try { return kinFromDate(otherBirth); } catch { return null; }
  }, [otherBirth]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Tzolkin</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">マヤ暦</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          KIN {myKin.kin}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          260 日が刻む、銀河のリズム。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          ツォルキン 260 日暦 (20 紋章 × 13 音)。GMT 584283 相関で KIN を算出。
          2012-12-21 = KIN 207 検証済み。
        </p>
      </header>

      {/* 自分の KIN */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">あなたの銀河の署名 ／ Galactic Signature</div>
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className="inline-block w-10 h-10 border-[3px] border-current flex-shrink-0"
            style={{ background: COLOR_BG[myKin.seal.color] }}
          />
          <div>
            <div className="editorial-display-jp text-3xl sm:text-5xl">
              {myKin.tone.name}の{myKin.seal.name}
            </div>
            <div className="editorial-mono text-xs opacity-60 mt-1">
              KIN {myKin.kin} ／ {myKin.seal.maya} ／ 銀河の音 {myKin.tone.num}
            </div>
          </div>
        </div>
        <p className="text-sm sm:text-base leading-relaxed mt-5">{myKin.seal.traits}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">紋章のキーワード</div>
            <div className="text-sm mt-1">{myKin.seal.keyword}</div>
          </div>
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">銀河の音 {myKin.tone.num} ─ {myKin.tone.keyword}</div>
            <div className="text-sm mt-1">{myKin.tone.meaning}</div>
          </div>
        </div>
      </section>

      {/* 関係キン (ガイド・反対・神秘・類似) */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">関係キン ／ Oracle</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            ["ガイドキン (導き)", myKin.guide],
            ["類似キン (支え)", myKin.analog],
            ["反対キン (挑戦)", myKin.antipode],
            ["神秘キン (隠れた力)", myKin.occult],
          ] as const).map(([label, seal]) => (
            <div key={label} className="border-2 border-current p-3">
              <div className="editorial-mono text-[9px] opacity-60">{label}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-block w-3.5 h-3.5 border-2 border-current flex-shrink-0" style={{ background: COLOR_BG[seal.color] }} />
                <span className="editorial-display-jp text-base leading-tight">{seal.name}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="editorial-mono text-[9px] opacity-50 mt-4">
          ウェイブスペル (13 日周期の目的): {myKin.wavespell.name}
        </p>
      </section>

      {/* 今日の KIN */}
      {tKin && (
        <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
          <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今日の KIN ／ Today</div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-block w-8 h-8 border-[3px] border-current flex-shrink-0" style={{ background: COLOR_BG[tKin.seal.color] }} />
            <div>
              <div className="editorial-display-jp text-2xl sm:text-3xl">{tKin.tone.name}の{tKin.seal.name}</div>
              <div className="editorial-mono text-[10px] opacity-60">KIN {tKin.kin}</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed mt-4">
            今日のエネルギー: {tKin.seal.keyword} × {tKin.tone.keyword}。{tKin.tone.meaning}
          </p>
          <p className="text-xs opacity-70 mt-2">
            あなたとの関係: {kinCompat(myKin, tKin).text}
          </p>
        </section>
      )}

      {/* 家族の KIN */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">家族の KIN ／ Family</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <SealBadge kin={wifeKin} label="妻" />
            <p className="text-xs opacity-70 mt-2 leading-relaxed">{kinCompat(myKin, wifeKin).text}</p>
          </div>
          <div>
            <SealBadge kin={childKin} label="子" />
            <p className="text-xs opacity-70 mt-2 leading-relaxed">{kinCompat(myKin, childKin).text}</p>
          </div>
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
        {otherKin && (
          <div className="mt-5">
            <SealBadge kin={otherKin} label="相手" />
            <p className="text-sm mt-3 leading-relaxed">
              <span className="editorial-chip text-[10px] mr-2">{kinCompat(myKin, otherKin).level}</span>
              {kinCompat(myKin, otherKin).text}
            </p>
          </div>
        )}
      </section>

      {/* 20 紋章一覧 */}
      <section>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">20 の太陽の紋章 ／ All Seals</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOLAR_SEALS.map((s) => (
            <div key={s.index} className={`border-2 border-current p-3 ${s.index === myKin.seal.index ? "tab-btn-active" : ""}`}>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border border-current flex-shrink-0" style={{ background: COLOR_BG[s.color] }} />
                <span className="editorial-display-jp text-sm leading-tight">{s.name}{s.index === myKin.seal.index && " ★"}</span>
              </div>
              <div className="editorial-mono text-[8px] opacity-60 mt-1">{s.maya} ／ {s.keyword}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
