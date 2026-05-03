"use client";

import { useState } from "react";
import { calcFourPillars, DAY_MASTER_TEXT, type FourPillars } from "@/lib/shichu";

export default function ShichuPage() {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState<string>("");
  const [result, setResult] = useState<FourPillars | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const d = new Date(date);
    const h = hour === "" ? null : Number(hour);
    setResult(
      calcFourPillars(d.getFullYear(), d.getMonth() + 1, d.getDate(), h)
    );
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-400">
          Shichu Suimei
        </div>
        <h1 className="font-serif text-3xl mt-1">四柱推命</h1>
        <p className="text-sm text-ink-500 mt-2">
          生年月日時から年・月・日・時の四柱（八字）を導きます。
        </p>
        <p className="text-xs text-ink-400 mt-1">
          ※ 節気は固定日の簡易計算です。境界日±1日は誤差が出る可能性があります。
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-3 mb-10 max-w-md">
        <label className="block">
          <span className="text-xs text-ink-500">生年月日</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-500">生まれた時刻（任意・0-23時）</span>
          <input
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="例: 14"
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-ink-900 text-white px-5 py-2 hover:bg-ink-700"
        >
          命式を出す
        </button>
      </form>

      {result && (
        <section className="rounded-xl border border-ink-100 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <PillarCell label="時柱" pillar={result.hour} />
            <PillarCell label="日柱" pillar={result.day} highlight />
            <PillarCell label="月柱" pillar={result.month} />
            <PillarCell label="年柱" pillar={result.year} />
          </div>

          <div className="border-t border-ink-100 mt-6 pt-6">
            <div className="text-xs uppercase tracking-widest text-ink-400">
              日主（あなた本人）
            </div>
            <div className="font-serif text-xl mt-1">
              {result.dayMaster.stem} ・ {result.dayMaster.element}
            </div>
            <p className="text-sm text-ink-700 mt-2">
              {DAY_MASTER_TEXT[result.dayMaster.element]}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function PillarCell({
  label,
  pillar,
  highlight,
}: {
  label: string;
  pillar: { stem: string; branch: string; stemElement: string; branchElement: string } | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border ${
        highlight ? "border-ink-900" : "border-ink-100"
      } p-4`}
    >
      <div className="text-xs uppercase tracking-widest text-ink-400">
        {label}
      </div>
      {pillar ? (
        <>
          <div className="font-serif text-3xl mt-1">{pillar.stem}</div>
          <div className="text-xs text-ink-500">{pillar.stemElement}</div>
          <div className="font-serif text-3xl mt-2">{pillar.branch}</div>
          <div className="text-xs text-ink-500">{pillar.branchElement}</div>
        </>
      ) : (
        <div className="text-sm text-ink-400 mt-3">—</div>
      )}
    </div>
  );
}
