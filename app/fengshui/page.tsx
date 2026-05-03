"use client";

import { useState } from "react";
import {
  calcKua,
  dirRatings,
  KUA_NAMES,
  RATING_TEXT,
  type Gender,
  type DirRating,
} from "@/lib/fengshui";

export default function FengShuiPage() {
  const [date, setDate] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [result, setResult] = useState<{
    kua: number;
    ratings: ReturnType<typeof dirRatings>;
  } | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const d = new Date(date);
    const k = calcKua(d.getFullYear(), d.getMonth() + 1, d.getDate(), gender);
    setResult({ kua: k, ratings: dirRatings(k) });
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-400">
          Feng Shui
        </div>
        <h1 className="font-serif text-3xl mt-1">風水（本命卦）</h1>
        <p className="text-sm text-ink-500 mt-2">
          生年月日と性別から本命卦を導き、8方位の吉凶を表示します。
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
        <fieldset>
          <legend className="text-xs text-ink-500 mb-1">性別</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />
              <span className="text-sm">男性</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />
              <span className="text-sm">女性</span>
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          className="rounded-md bg-ink-900 text-white px-5 py-2 hover:bg-ink-700"
        >
          本命卦を出す
        </button>
      </form>

      {result && (
        <section className="rounded-xl border border-ink-100 p-6">
          <div className="flex items-center gap-4">
            <div className="font-serif text-5xl tabular-nums">
              {result.kua}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-400">
                本命卦
              </div>
              <div className="font-serif text-xl">
                {KUA_NAMES[result.kua].name}（
                {KUA_NAMES[result.kua].group}）
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6 max-w-sm mx-auto">
            <DirCell rating={find(result.ratings, "西北")} dir="西北" />
            <DirCell rating={find(result.ratings, "北")} dir="北" />
            <DirCell rating={find(result.ratings, "東北")} dir="東北" />
            <DirCell rating={find(result.ratings, "西")} dir="西" />
            <div className="aspect-square rounded-lg bg-ink-900 text-white flex items-center justify-center text-xs">
              中央
            </div>
            <DirCell rating={find(result.ratings, "東")} dir="東" />
            <DirCell rating={find(result.ratings, "西南")} dir="西南" />
            <DirCell rating={find(result.ratings, "南")} dir="南" />
            <DirCell rating={find(result.ratings, "東南")} dir="東南" />
          </div>

          <div className="mt-8 space-y-2">
            {result.ratings.map((r) => (
              <div
                key={r.dir}
                className="flex items-start gap-3 text-sm border-b border-ink-100 pb-2"
              >
                <div className="w-12 text-ink-500">{r.dir}</div>
                <div
                  className={`w-12 font-medium ${
                    r.kind === "吉" ? "text-ink-900" : "text-ink-400"
                  }`}
                >
                  {r.rating}
                </div>
                <div className="flex-1 text-ink-600">{RATING_TEXT[r.rating]}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function find(
  ratings: ReturnType<typeof dirRatings>,
  dir: string
) {
  return ratings.find((r) => r.dir === dir)!;
}

function DirCell({
  dir,
  rating,
}: {
  dir: string;
  rating: { rating: DirRating; kind: "吉" | "凶" };
}) {
  return (
    <div
      className={`aspect-square rounded-lg border ${
        rating.kind === "吉"
          ? "border-ink-900 bg-ink-50"
          : "border-ink-200 bg-white"
      } flex flex-col items-center justify-center text-xs p-1`}
    >
      <div className="text-ink-500">{dir}</div>
      <div className="font-medium mt-1">{rating.rating}</div>
    </div>
  );
}
