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
    title: "2026 年丙午 — 戊申命に降りる『陽火淬土』の鍛錬年",
    summary: "2026 丙午は『陽火に淬される土器の年』。戊癸合化火が発火し、正財が表舞台へ。重要月 = 2/5/7/9/11 月。",
  },
  {
    id: "shichu-daiun-transition",
    category: "大運",
    title: "癸酉から甲戌へ — 51 歳の地殻変動と 42 歳からの十年仕込み",
    summary: "2035 年 (51 歳) に正財→偏官の 180 度反転。42-50 歳で収入柱 3 本・健康・後継者・哲学を仕込む。",
  },
  {
    id: "shichu-balance",
    category: "五行バランス",
    title: "偏土命の地形図 — 火と水を呼び込み『生きた山』になる処方箋",
    summary: "火 0・水 1 の偏土命。南方位・表現活動・実火で火を、北方位・流動資産・水場で水を補う。",
  },
  {
    id: "shadow",
    category: "魂の鍛錬",
    title: "ユング的シャドウ — 戊土の INFJ × マスター 11 が抑圧する『荒ぶる自我』の統合",
    summary: "怒り・利己・怠惰・動物性の四大抑圧を、シャドウ日記・身体発散・撤退期間・分析家面談で統合する。",
  },
];
