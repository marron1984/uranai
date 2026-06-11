// ★必読カードの軽量メタデータ
// synthesisDeep.ts 全体 (483 行・数万字) を読み込まずに、
// 今日タブから「基礎タブの必読カードへの導線」を提供するための最小データ。
// 表示専用の title/summary/anchor のみで、本文は dynamic import 経由のみ。

export type EssentialMeta = {
  id: string;        // anchor id (BasisTab の DeepCardSlot と一致)
  category: string;  // 大カテゴリ (四柱推命 / 数秘 / 統合 等)
  title: string;
  summary: string;
};

// synthesisDeep.ts 内の priority: "essential" 付きカードと同期する。
// 追加・変更時はこのリストと両方を更新する。
export const ESSENTIAL_CARDS: EssentialMeta[] = [
  {
    id: "annual-2026",
    category: "今年の運勢",
    title: "2026 年丙午 — 丙火日主に巡る『比劫の火』の自我点火年",
    summary: "2026 丙午は比肩 (丙) と羊刃 (午) が巡る年。子午冲で軸が揺れ、午未合で家庭に火が灯る。身弱の丙火には帮身の援軍だが、競争・散財・感情の過熱に注意。重要月 = 2/5/7/9/11 月。",
  },
  {
    id: "shichu-daiun-transition",
    category: "大運",
    title: "癸酉から甲戌へ — 51 歳の地殻変動と 42 歳からの十年仕込み",
    summary: "2035 年 (51 歳) に正官 (癸酉) → 偏印 (甲戌) へ。名誉のフェーズから知性・継承のフェーズへ移行。42-50 歳で社会的信用・健康・後継者・哲学を仕込む。",
  },
  {
    id: "shichu-balance",
    category: "五行バランス",
    title: "丙火の燃料管理 — 木で薪を足し、土の出し過ぎを抑えて燃え続ける処方箋",
    summary: "木2火1土3金1水1。偏土命ではなく、印 (木) が支えるやや身弱の丙火。木 (学び・自然・朝) と火 (仲間・情熱) で補い、土 (尽くしすぎ・働きすぎ) の出し過ぎに注意。",
  },
  {
    id: "shadow",
    category: "魂の鍛錬",
    title: "ユング的シャドウ — 丙火の INFJ × マスター 11 が抑圧する『荒ぶる自我』の統合",
    summary: "怒り・利己・怠惰・動物性の四大抑圧を、シャドウ日記・身体発散・撤退期間・分析家面談で統合する。",
  },
];
