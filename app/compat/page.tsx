"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OWNER } from "@/lib/owner";
import { calcCompat, guessMbti, buildPartnerProfile, type CompatResult, type PartnerInput } from "@/lib/compatCheck";
import { MBTI_PROFILES, type MbtiType } from "@/lib/mbti";

const MBTI_OPTIONS: (MbtiType | "")[] = [
  "",
  "INFJ", "INFP", "INTJ", "INTP",
  "ENFJ", "ENFP", "ENTJ", "ENTP",
  "ISFJ", "ISFP", "ISTJ", "ISTP",
  "ESFJ", "ESFP", "ESTJ", "ESTP",
];

// プリセット (家族など)
const PRESETS: Record<string, PartnerInput> = {
  妻: { name: "妻", birth: OWNER.family.spouse.birth, gender: "female", mbti: "ENFJ" },
  子: { name: "子", birth: OWNER.family.child.birth,  gender: "male",   mbti: "ENFP" },
};

type SavedPartner = PartnerInput & { savedAt: string; relation?: string };
const STORAGE_KEY = "uranai-saved-partners";

function loadPartners(): SavedPartner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function savePartners(list: SavedPartner[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function CompatPage() {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [mbti, setMbti] = useState<MbtiType | "">("");
  const [relation, setRelation] = useState("");
  const [autoMbti, setAutoMbti] = useState(false);
  const [saved, setSaved] = useState<SavedPartner[]>([]);

  useEffect(() => {
    setSaved(loadPartners());
  }, []);

  // 入力が十分なら相性を即計算
  const result = useMemo<CompatResult | null>(() => {
    if (!birth || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
    let useMbti: MbtiType | undefined = mbti || undefined;
    if (!useMbti && autoMbti) {
      const profile = buildPartnerProfile({ name: name || "相手", birth, gender });
      useMbti = guessMbti(profile);
    }
    try {
      return calcCompat({ name: name || "相手", birth, gender, mbti: useMbti });
    } catch {
      return null;
    }
  }, [name, birth, gender, mbti, autoMbti]);

  const applyPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setName(p.name);
    setBirth(p.birth);
    setGender(p.gender);
    setMbti(p.mbti ?? "");
    setRelation(key);
  };

  const onSave = () => {
    if (!birth) return;
    const entry: SavedPartner = {
      name: name || "相手",
      birth,
      gender,
      mbti: mbti || undefined,
      relation: relation || undefined,
      savedAt: new Date().toISOString(),
    };
    const next = [entry, ...saved.filter((s) => !(s.birth === birth && s.name === entry.name))].slice(0, 30);
    setSaved(next);
    savePartners(next);
  };

  const onLoad = (s: SavedPartner) => {
    setName(s.name);
    setBirth(s.birth);
    setGender(s.gender);
    setMbti(s.mbti ?? "");
    setRelation(s.relation ?? "");
  };

  const onDelete = (b: string, n: string) => {
    const next = saved.filter((s) => !(s.birth === b && s.name === n));
    setSaved(next);
    savePartners(next);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compat-${result.partner.name}-${result.partner.birth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      {/* ヘッダー */}
      <header className="border-b border-current pb-5 sm:pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Compatibility</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">相性鑑定</span>
          <span className="editorial-chip text-[10px] sm:text-xs"><span className="editorial-chip-num">vs</span>{OWNER.displayName}</span>
        </div>
        <h1 className="editorial-display text-[18vw] sm:text-[12vw] lg:text-[110px] leading-[0.85] uppercase break-words">
          DO WE
          <br />
          MATCH?
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 sm:mt-4 leading-snug">
          二人の星と数字を、6 軸で照合する。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          通変星 / 年支 / 九星 / 太陽星座 / ライフパス / 本命卦 / MBTI の 7 軸を
          重み付き平均で総合スコア化。家族・友人・ビジネスパートナーまで。
        </p>
      </header>

      {/* 入力フォーム */}
      <section className="border border-current p-4 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-5 sm:mb-6 text-[10px] sm:text-xs">入力 ／ Input</div>

        {/* プリセット */}
        <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
          <span className="editorial-mono text-[10px] opacity-70 self-center mr-1">PRESET:</span>
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => applyPreset(k)}
              className="editorial-chip text-[10px] sm:text-xs"
            >
              {k} ({PRESETS[k].birth.slice(0, 4)})
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">NAME ／ 名前</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田太郎"
              className="mt-1 w-full border border-current px-3 py-3 sm:py-2 bg-transparent focus:outline-none editorial-display-jp text-base sm:text-lg min-h-[44px]"
            />
          </label>

          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">RELATION ／ 関係 (任意)</span>
            <input
              type="text"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="例: 友人 / 同僚 / 取引先"
              className="mt-1 w-full border border-current px-3 py-3 sm:py-2 bg-transparent focus:outline-none editorial-display-jp text-base sm:text-lg min-h-[44px]"
            />
          </label>

          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 生年月日</span>
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="mt-1 w-full border border-current px-3 py-3 sm:py-2 bg-transparent focus:outline-none editorial-display-jp text-base sm:text-lg min-h-[44px]"
            />
          </label>

          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">GENDER ／ 性別</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="mt-1 w-full border border-current px-3 py-3 sm:py-2 bg-transparent focus:outline-none editorial-display-jp text-base sm:text-lg min-h-[44px]"
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="editorial-mono text-[10px] opacity-70">MBTI ／ 任意 (本人テスト or 観察)</span>
            <div className="mt-1 flex gap-2 flex-col sm:flex-row">
              <select
                value={mbti}
                onChange={(e) => setMbti(e.target.value as MbtiType | "")}
                className="border border-current px-3 py-3 sm:py-2 bg-transparent focus:outline-none editorial-display-jp text-base sm:text-lg flex-1 min-w-0 sm:min-w-[150px] min-h-[44px]"
              >
                {MBTI_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t || "未設定"}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAutoMbti((a) => !a)}
                className={`${autoMbti ? "editorial-chip editorial-chip-dark" : "editorial-chip"} min-h-[44px] justify-center sm:flex-shrink-0`}
              >
                {autoMbti ? "✓ 自動推定 ON" : "自動推定 OFF"}
              </button>
            </div>
            <p className="editorial-mono text-[10px] mt-1.5 opacity-60 leading-relaxed">
              ※ 自動推定は星座 + LP から簡易判定 (参考程度・本人テスト推奨)
            </p>
          </label>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={onSave} disabled={!birth} className="editorial-chip min-h-[44px] flex-1 sm:flex-none justify-center disabled:opacity-40">
            保存 ／ SAVE
          </button>
          <button type="button" onClick={exportJson} disabled={!result} className="editorial-chip min-h-[44px] flex-1 sm:flex-none justify-center disabled:opacity-40">
            JSON エクスポート ／ EXPORT
          </button>
        </div>
      </section>

      {/* 保存リスト */}
      {saved.length > 0 && (
        <section>
          <div className="editorial-chip mb-4">保存済み ／ Saved ({saved.length})</div>
          <div className="flex flex-wrap gap-2">
            {saved.map((s) => (
              <div key={s.birth + s.name} className="border border-current px-3 py-2 flex items-center gap-2" style={{ background: "var(--background)" }}>
                <button type="button" onClick={() => onLoad(s)} className="text-left">
                  <div className="editorial-display-jp text-base">{s.name}</div>
                  <div className="editorial-mono text-[9px] opacity-60">{s.birth}{s.relation ? " · " + s.relation : ""}{s.mbti ? " · " + s.mbti : ""}</div>
                </button>
                <button type="button" onClick={() => onDelete(s.birth, s.name)} className="opacity-50 hover:opacity-100 text-xs ml-2">×</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 結果 */}
      {result && <ResultView result={result} />}

      {/* 算出ロジック説明 */}
      <section className="border-t border-current pt-6 mt-12">
        <div className="editorial-chip mb-4">算出ロジック ／ Algorithm</div>
        <p className="text-sm leading-relaxed opacity-80 max-w-2xl">
          7 つの占術軸を重み付き平均で総合スコア化:
        </p>
        <ul className="mt-3 text-sm leading-relaxed grid sm:grid-cols-2 gap-x-6 gap-y-1 max-w-3xl">
          <li>• 通変星 (戊→相手日干) × 重み 1.0</li>
          <li>• 年支 (子×相手年支) × 重み 1.0</li>
          <li>• 九星 (7 × 相手本命星) × 重み 0.8</li>
          <li>• 太陽星座 (牡牛×相手星座) × 重み 0.6</li>
          <li>• ライフパス (11 × 相手LP) × 重み 0.7</li>
          <li>• 本命卦 (6 × 相手卦) × 重み 0.5</li>
          <li>• MBTI (INFJ×相手) × 重み 0.8 (任意)</li>
        </ul>
        <p className="text-xs mt-4 opacity-60">
          詳細: <Link href="https://github.com/marron1984/uranai/blob/main/docs/compat-rules.json" className="underline">docs/compat-rules.json</Link>
        </p>
      </section>
    </div>
  );
}

function ResultView({ result }: { result: CompatResult }) {
  return (
    <section className="space-y-6 sm:space-y-8">
      {/* 総合スコア */}
      <div className="border border-current p-5 sm:p-10 text-center relative" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-3 sm:mb-4 inline-flex text-[10px] sm:text-xs">RESULT ／ 総合相性</div>
        <div className="editorial-display text-[26vw] sm:text-[120px] leading-none my-3 sm:my-4">
          {result.weightedScore.toFixed(1)}
          <span className="text-2xl sm:text-3xl opacity-60"> / 5</span>
        </div>
        <div className="text-3xl sm:text-4xl tracking-wider mb-2 sm:mb-3">
          {"★".repeat(result.overall)}{"☆".repeat(5 - result.overall)}
        </div>
        <p className="editorial-display-jp text-base sm:text-2xl mt-3 sm:mt-4 max-w-2xl mx-auto leading-snug">
          {result.summary}
        </p>
      </div>

      {/* 占術師ナレーション */}
      <div className="border border-current p-4 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-3 sm:mb-4 text-[10px] sm:text-xs">占術師の総評 ／ Narrative</div>
        <p className="text-sm sm:text-lg leading-relaxed sm:leading-loose">{result.narrative}</p>
      </div>

      {/* 軸別スコア */}
      <div>
        <div className="editorial-chip mb-3 sm:mb-4 text-[10px] sm:text-xs">軸別スコア ／ Axis Breakdown</div>
        <div className="space-y-2">
          {result.axes.map((ax) => (
            <div key={ax.id} className="border border-current p-3 sm:p-4 flex items-start gap-3 sm:gap-4" style={{ background: "var(--background)" }}>
              <div className="flex-shrink-0">
                <div className="text-lg sm:text-2xl tracking-wider tabular-nums whitespace-nowrap">
                  {"★".repeat(ax.score)}{"☆".repeat(5 - ax.score)}
                </div>
                <div className="editorial-mono text-[9px] sm:text-[10px] opacity-60 mt-1 text-center">
                  w={ax.weight.toFixed(1)} · {ax.score}/5
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="editorial-display-jp text-sm sm:text-lg leading-snug break-words">{ax.label}</div>
                <div className="text-xs sm:text-sm opacity-80 mt-1 leading-relaxed">{ax.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 相手プロファイル詳細 */}
      <div className="border border-current p-4 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-3 sm:mb-4 text-[10px] sm:text-xs">相手プロファイル ／ Partner Profile</div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
          {([
            ["生年月日", result.partner.birth],
            ["性別", result.partner.gender === "male" ? "男性" : "女性"],
            ["日干/年支", `${result.partner.dayStem} / ${result.partner.yearBranch}`],
            ["九星本命", String(result.partner.honmei)],
            ["本命卦", String(result.partner.kua)],
            ["太陽星座", result.partner.sunSignName],
            ["ライフパス", String(result.partner.lifePath)],
            ["BC Personality", `${result.partner.birthCardPersonalityName} (${result.partner.birthCardPersonality})`],
            ["BC Soul", `${result.partner.birthCardSoulName} (${result.partner.birthCardSoul})`],
            ["MBTI", result.partner.mbti ?? "未設定"],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="border-b border-current/30 pb-2">
              <div className="editorial-mono text-[9px] opacity-60">{k}</div>
              <div className="editorial-display-jp text-sm sm:text-base mt-0.5 break-words">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
