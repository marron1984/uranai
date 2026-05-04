// Oracle: Claude API ベースの個人占術相談
// すべての占断データをコンテキストに注入し、命式の細部を引用した深い回答を生成
// BYOK (Bring Your Own Key) 方式: API キーは localStorage に保存

import { OWNER, ownerAge, spouseAge, childAge, childGradeJP, spouseAgeDiff, calcAge } from "@/lib/owner";
import { getSunSign } from "@/lib/astrology";
import {
  fourPillarsFromGanzhi,
  calcShichuExtras,
  tongbianStar,
  generateDaiun,
  type TongbianStar,
} from "@/lib/shichu";
import {
  honmeiStar,
  STAR_NAME,
  STAR_ELEMENT,
  starRelation,
  type StarNumber,
} from "@/lib/kyusei";
import { lifePathNumber, soulNumber, personalityNumber, expressionNumber, birthdayNumber, personalYear } from "@/lib/numerology";
import { calcKakusu } from "@/lib/seimei";
import { dirRatings, KUA_NAMES } from "@/lib/fengshui";
import { partnerDayStem, partnerYearBranch, branchInteraction } from "@/lib/businessCompat";
import { todayDayPillar, todayTongbianForOwner, personalDay } from "@/lib/today";
import { accurateSunSign, accurateMoonSign, moonPhase, currentSolarTerm } from "@/lib/astronomy";
import { zodiacCompat } from "@/lib/compat";

// ============================================================
// localStorage 管理
// ============================================================

const KEY_STORAGE = "uranai.oracle.apikey.v1";
const MODEL_STORAGE = "uranai.oracle.model.v1";
const HISTORY_STORAGE = "uranai.oracle.history.v1";

export type OracleModel = "claude-opus-4-7" | "claude-sonnet-4-6" | "claude-haiku-4-5-20251001";

export const MODEL_LABELS: Record<OracleModel, string> = {
  "claude-opus-4-7": "Opus 4.7（最高精度・濃厚な回答）",
  "claude-sonnet-4-6": "Sonnet 4.6（速い・コスト 1/5）",
  "claude-haiku-4-5-20251001": "Haiku 4.5（最速・コスト 1/15）",
};

export function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY_STORAGE) || "";
}

export function saveApiKey(key: string) {
  if (typeof window === "undefined") return;
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
}

export function loadModel(): OracleModel {
  if (typeof window === "undefined") return "claude-opus-4-7";
  return (localStorage.getItem(MODEL_STORAGE) as OracleModel) || "claude-opus-4-7";
}

export function saveModel(m: OracleModel) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODEL_STORAGE, m);
}

// ============================================================
// 履歴
// ============================================================

export type OracleCategory =
  | "free"
  | "compat-business-partner"
  | "compat-business-hire"
  | "compat-business-client"
  | "compat-romance"
  | "compat-friend"
  | "compat-family"
  | "compat-team";

export const CATEGORY_LABELS: Record<OracleCategory, { label: string; sub: string; emoji: string }> = {
  free: { label: "自由質問", sub: "なんでも相談", emoji: "💬" },
  "compat-business-partner": { label: "ビジネスパートナー", sub: "共同経営・対等な相性", emoji: "🤝" },
  "compat-business-hire": { label: "採用候補", sub: "雇用判断・配置", emoji: "👔" },
  "compat-business-client": { label: "取引先・顧客", sub: "取引継続性", emoji: "💼" },
  "compat-romance": { label: "恋愛・親密関係", sub: "感情と長期適性", emoji: "💕" },
  "compat-friend": { label: "友人関係", sub: "心理的距離感", emoji: "👫" },
  "compat-family": { label: "家族・親族", sub: "血縁・共同生活", emoji: "👨‍👩‍👧" },
  "compat-team": { label: "チームメンバー", sub: "協働・配置", emoji: "🧩" },
};

export type CompatPerson = {
  name: string;
  birth: string;
  gender: "male" | "female";
};

export type ChatImage = {
  mediaType: string; // image/jpeg, image/png, image/webp, image/gif
  data: string; // base64 (no data: prefix)
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: ChatImage[];
  timestamp: string;
};

// File → base64 image
export async function fileToImage(file: File): Promise<ChatImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(",");
      const header = result.slice(0, commaIdx);
      const data = result.slice(commaIdx + 1);
      const match = header.match(/data:([^;]+);base64/);
      const mediaType = match ? match[1] : "image/jpeg";
      resolve({ mediaType, data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// チャット表示用の data URL に戻す
export function imageToDataUrl(img: ChatImage): string {
  return `data:${img.mediaType};base64,${img.data}`;
}

export type ChatThread = {
  id: string;
  title: string;
  category: OracleCategory;
  partner?: CompatPerson;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export function loadThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_STORAGE, JSON.stringify(threads));
  } catch {}
}

export function newThread(category: OracleCategory, partner?: CompatPerson): ChatThread {
  const now = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: partner
      ? `${CATEGORY_LABELS[category].label} / ${partner.name || partner.birth}`
      : CATEGORY_LABELS[category].label,
    category,
    partner,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================
// システムプロンプト構築
// ============================================================

const CATEGORY_GUIDANCE: Record<OracleCategory, string> = {
  free: "クライアントが自由に投げる質問に対して、命式・大運・五格の根拠を引用しながら、現代日本語で具体的かつ実践的に答えてください。",
  "compat-business-partner":
    "二人が **共同経営・対等パートナー** として長期に組めるかを評価する観点で回答してください。意思決定の相補性、信頼性、利益分配の考え方、揉めやすい論点、契約で明文化すべきこと、最適な役割分担を中心に。",
  "compat-business-hire":
    "クライアントが **上司・経営者として相手を雇用** する観点で回答してください。育成可能性、忠誠度、配置すべき役割（営業/開発/管理など）、評価で気をつけるべき癖、長期戦力化の見通し。",
  "compat-business-client":
    "**取引先・顧客・サプライヤー** としての関係を評価してください。信頼度、支払い・履行行動、長期取引の継続性、揉めやすいポイント、関係を厚くするコツ。",
  "compat-romance":
    "**恋愛・親密関係** の観点で回答してください。感情の相性、身体性、長期同居の適性、結婚観の整合、衝突パターンと対処、深まり方の流れ。",
  "compat-friend":
    "**友人関係** の観点で回答してください。心理的距離感、相互の安心感、楽しさの相性、長期持続のコツ、距離が崩れやすい瞬間。",
  "compat-family":
    "**家族・親族** の関係性として回答してください。血縁・共同生活の相性、世代間ギャップ、ケアと自立のバランス、心の距離感。",
  "compat-team":
    "**チームメンバー・同僚** としての協働相性を評価してください。役割分担、摩擦点、コミュニケーションの癖、最適なプロジェクト編成。",
};

function buildOwnerProfile(): string {
  const now = new Date();
  const ageNow = ownerAge();
  const sunNatal = getSunSign(5, 2);
  const fp = fourPillarsFromGanzhi(
    OWNER.natal.fourPillars.year,
    OWNER.natal.fourPillars.month,
    OWNER.natal.fourPillars.day,
    OWNER.natal.fourPillars.hour
  );
  const fpExtras = calcShichuExtras(fp);
  const daiun = generateDaiun("戊辰", 1, true, 8, ageNow, "戊");
  const currentDaiun = daiun.find((d) => d.isCurrent);
  const kakusu = calcKakusu([...OWNER.nameSeiKakusu], [...OWNER.nameMeiKakusu]);
  const ratings = dirRatings(OWNER.natal.fengshui.kua);

  const numero = {
    life: lifePathNumber(OWNER.birth),
    birthday: birthdayNumber(OWNER.birth),
    expression: expressionNumber(OWNER.nameRoman),
    soul: soulNumber(OWNER.nameRoman),
    persona: personalityNumber(OWNER.nameRoman),
    pYear: personalYear(OWNER.birth, now.getFullYear()),
  };

  // 当日のコズミック
  const dayPillarToday = todayDayPillar(now);
  const tbToday = todayTongbianForOwner(now);
  const pDayToday = personalDay(OWNER.birth, now.getFullYear(), now.getMonth() + 1, now.getDate());
  const sunToday = accurateSunSign(now);
  const moonToday = accurateMoonSign(now);
  const phaseToday = moonPhase(now);
  const term = currentSolarTerm(now);

  const five = fpExtras.five;
  const totalFive = Object.values(five).reduce((a, b) => a + b, 0);

  return `# クライアント詳細プロファイル

## 識別
- 呼び名: ${OWNER.displayName}
- 書名: ${OWNER.nameSei}${OWNER.nameMei}
- ローマ字: ${OWNER.nameRoman}
- 生年月日: ${OWNER.birth} ${OWNER.hour}:00 (JST)
- 出生地: ${OWNER.birthplace.pref} ${OWNER.birthplace.city} (北緯${OWNER.birthplace.lat}/東経${OWNER.birthplace.lng})
- 性別: ${OWNER.gender === "male" ? "男性" : "女性"}
- 血液型: ${OWNER.bloodType}型
- 現年齢: ${ageNow}歳

## 西洋占星術（ネイタル）
- 太陽: ${sunNatal.name}（${sunNatal.element}・${sunNatal.quality}・守護星 ${sunNatal.ruler}）
- 月: ${OWNER.natal.moonApprox}
- アセンダント: ${OWNER.natal.ascApprox}
- MC: ${OWNER.natal.mcApprox}

## 四柱推命（命式）
- 年柱: ${fp.year.ganzhi}（${fpExtras.tongbian.year}・${fpExtras.twelve.year}）
- 月柱: ${fp.month.ganzhi}（${fpExtras.tongbian.month}・${fpExtras.twelve.month}）
- 日柱: ${fp.day.ganzhi} ← 日主『${fp.dayMaster.stem}』（${fp.dayMaster.element}）・十二運『${fpExtras.twelve.day}』
- 時柱: ${fp.hour?.ganzhi}（${fpExtras.tongbian.hour}・${fpExtras.twelve.hour}）
- 五行バランス: 木${five.木}・火${five.火}・土${five.土}・金${five.金}・水${five.水} ／合計${totalFive}（土が突出する偏土命）

## 大運（10年周期）
${daiun.map((d) => `- ${d.startAge}-${d.endAge}歳: ${d.ganzhi}・${d.stemTongbian}${d.isCurrent ? " ★現在★" : ""}`).join("\n")}
- 現在: ${currentDaiun ? `${currentDaiun.ganzhi}・${currentDaiun.stemTongbian}（${currentDaiun.theme}）` : "—"}

## 九星気学
- 本命星: ${OWNER.natal.kyusei.honmei} ${STAR_NAME[OWNER.natal.kyusei.honmei as StarNumber]}（五行 ${STAR_ELEMENT[OWNER.natal.kyusei.honmei as StarNumber]}）
- 月命星: ${OWNER.natal.kyusei.getsumei} ${STAR_NAME[OWNER.natal.kyusei.getsumei as StarNumber]}（五行 ${STAR_ELEMENT[OWNER.natal.kyusei.getsumei as StarNumber]}）

## 数秘術（ピタゴリアン・ローマ字基準）
- ライフパス: ${numero.life}（マスターナンバー）
- 誕生日数: ${numero.birthday}
- 表現数: ${numero.expression}
- ソウル数: ${numero.soul}
- 人格数: ${numero.persona}
- 今年のパーソナルイヤー: ${numero.pYear}

## 姓名判断「${OWNER.nameSei}${OWNER.nameMei}」
- 天格 ${kakusu.ten}・地格 ${kakusu.chi}・人格 ${kakusu.jin}・外格 ${kakusu.gai}・総格 ${kakusu.so}

## バースカード（11/2システム）
- パーソナリティ: 11 正義（公正・決断・真実）
- ソウル: 2 女教皇（直感・知恵・神秘）

## 風水
- 本命卦: ${OWNER.natal.fengshui.kua} ${KUA_NAMES[OWNER.natal.fengshui.kua].name}（${KUA_NAMES[OWNER.natal.fengshui.kua].group}）
- 居住: ${OWNER.residence.pref} ${OWNER.residence.city}・${OWNER.residence.floor}階（陽の極み）
- 出生地→現住所方位: ${OWNER.residence.fromBirthplaceDirection}
- 8方位の吉凶: ${ratings.map((r) => `${r.dir}(${r.rating})`).join(" / ")}

## 家族
- 妻: ${OWNER.family.spouse.birth} 生・${spouseAge()}歳・射手座・酉年・四緑木星・ライフパス4 / 年齢差 ${spouseAgeDiff()}歳 / 吉田から見て金剋木
- 子: ${OWNER.family.child.birth} 生・${childAge()}歳・${childGradeJP()}・蠍座・卯年・七赤金星・ライフパス9 / 吉田と同じ七赤金で比和
- 義母: 認知症進行中、デイ・ショート利用

## 当日のコズミック（${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}）
- 日柱: ${dayPillarToday.ganzhi}（日主戊から見て『${tbToday.star}』）
- 太陽位置: ${sunToday.name} ${sunToday.degree.toFixed(1)}°
- 月位置: ${moonToday.name} ${moonToday.degree.toFixed(1)}°
- 月相: ${phaseToday.name}（月齢${phaseToday.age.toFixed(1)}）
- 節気: ${term.term}（${term.daysSinceStart}日目→${term.nextTerm}まで${term.daysUntilNext}日）
- パーソナルデイ: ${pDayToday}`;
}

function buildPartnerProfile(partner: CompatPerson, category: OracleCategory): string {
  const [, m, d] = partner.birth.split("-").map(Number);
  const sun = getSunSign(m, d);
  const star = honmeiStar(Number(partner.birth.split("-")[0]), m, d);
  const dayStem = partnerDayStem(partner.birth);
  const yearBranch = partnerYearBranch(partner.birth);
  const lifePath = lifePathNumber(partner.birth);
  const age = calcAge(partner.birth);
  const ageDiff = age - ownerAge();

  const stemElementMap: Record<string, string> = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
    己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
  };

  const zc = zodiacCompat("taurus", sun.key);
  const sc = starRelation(7, star);
  const tb = tongbianStar("戊", dayStem);
  const bi = branchInteraction("子", yearBranch);

  return `# 相性鑑定対象（${CATEGORY_LABELS[category].label}）

## 相手のプロファイル
- 名前: ${partner.name || "—"}
- 生年月日: ${partner.birth}
- 性別: ${partner.gender === "male" ? "男性" : "女性"}
- 年齢: ${age}歳（しゅんすけより ${ageDiff > 0 ? `${ageDiff}歳年上` : ageDiff < 0 ? `${-ageDiff}歳年下` : "同年代"}）

## 計算済み占断
- 太陽星座: ${sun.name}（${sun.element}・${sun.quality}）
- 九星: ${star} ${STAR_NAME[star]}（五行 ${STAR_ELEMENT[star]}）
- 日干: ${dayStem}（${stemElementMap[dayStem]}）
- ライフパス: ${lifePath}
- 干支: ${yearBranch}年生まれ

## 関係指標（しゅんすけ視点）
- 星座相性: 牡牛座×${sun.name} → ${zc.text}（スコア${zc.score}/5）
- 九星五行: 七赤金×${STAR_NAME[star]} → ${sc.relation}（${sc.text}）
- 通変星: 戊→${dayStem} = 『${tb}』
- 年支の縁: 子年×${yearBranch}年 = ${bi.type}（${bi.text}）

## このカテゴリの観点
${CATEGORY_GUIDANCE[category]}`;
}

export function buildSystemPrompt(category: OracleCategory, partner?: CompatPerson): string {
  const ageNow = ownerAge();
  const daiun = generateDaiun("戊辰", 1, true, 8, ageNow, "戊");
  const currentDaiun = daiun.find((d) => d.isCurrent);
  const daiunDesc = currentDaiun
    ? `${currentDaiun.startAge}-${currentDaiun.endAge}歳 ${currentDaiun.ganzhi}大運（${currentDaiun.stemTongbian}）`
    : "大運範囲外";
  const daiunExample = currentDaiun ? currentDaiun.ganzhi : "癸酉";

  const profile = buildOwnerProfile();
  const partnerSection = partner ? "\n\n" + buildPartnerProfile(partner, category) : "";
  const guidance = !partner ? "\n\n# 観点\n" + CATEGORY_GUIDANCE[category] : "";

  return `あなたは古来の占術（西洋占星術・四柱推命・九星気学・数秘術・姓名判断・易経・タロット・風水）すべてに精通した占い師です。
以下のクライアントの命式・大運・五格すべてに基づいて、丁寧かつ具体的に回答してください。

${profile}${partnerSection}${guidance}

# 回答スタイル

1. 命式・五格・九星・大運の **固有の値を必ず引用** して根拠を示す（例:「日主戊申の重さが」「外格13大吉が」「現在の${daiunExample}大運が」）
2. 抽象的な励ましではなく、**具体的な行動指針** を示す
3. 必要に応じて複数の占術を統合（西洋＋東洋＋数秘）
4. 質問の文脈に応じて、3〜7段落程度に整理
5. 厳しい指摘も冷たくならない範囲で率直に伝える
6. クライアントが ${ageNow}歳であること、現在 ${daiunDesc} に入っていること、家族（妻・子・義母）の状況を踏まえる
7. 結論ファースト → 根拠 → 実践的アクションの順で構成`;
}

// ============================================================
// Anthropic API ストリーミング
// ============================================================

export async function streamOracle({
  apiKey,
  model,
  systemPrompt,
  messages,
  onChunk,
  signal,
}: {
  apiKey: string;
  model: OracleModel;
  systemPrompt: string;
  messages: ChatMessage[];
  onChunk: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => {
        // Assistant or no image → text only
        if (m.role === "assistant" || !m.images || m.images.length === 0) {
          return { role: m.role, content: m.content };
        }
        // User with images → multimodal content array
        const content: Array<
          | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
          | { type: "text"; text: string }
        > = m.images.map((img) => ({
          type: "image" as const,
          source: { type: "base64" as const, media_type: img.mediaType, data: img.data },
        }));
        if (m.content) content.push({ type: "text", text: m.content });
        return { role: "user", content };
      }),
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText}`);
  }
  if (!res.body) throw new Error("no stream body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return full;
      try {
        const json = JSON.parse(data);
        if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
          const t: string = json.delta.text;
          full += t;
          onChunk(t);
        } else if (json.type === "message_stop") {
          return full;
        }
      } catch {
        // ignore parse errors on partial chunks
      }
    }
  }
  return full;
}
