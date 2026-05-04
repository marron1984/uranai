// 日々のジャーナル蓄積（localStorage）
// 蓄積データから、占断のどれが当たりやすいか・パーソナルデイ別の傾向などを分析

const JOURNAL_KEY = "uranai.journal.v2";

export type Hit = "hit" | "miss" | "unknown" | null;

export type JournalEntry = {
  date: string; // YYYY-MM-DD
  mood?: number; // 1-5
  energy?: number; // 1-5
  event?: string;
  forecastHits?: {
    tarot?: Hit;
    iching?: Hit;
    daily?: Hit;
    synthesis?: Hit;
  };
  perfumeUsed?: string; // perfume id
  notes?: string;
  updatedAt?: string;
};

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadAll(): Record<string, JournalEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(JOURNAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAll(data: Record<string, JournalEntry>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(data));
  } catch {}
}

export function saveEntry(entry: JournalEntry) {
  const all = loadAll();
  all[entry.date] = {
    ...all[entry.date],
    ...entry,
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
}

export function getEntry(date: string): JournalEntry | null {
  const all = loadAll();
  return all[date] || null;
}

export function deleteEntry(date: string) {
  const all = loadAll();
  delete all[date];
  saveAll(all);
}

export function entryCount(): number {
  return Object.keys(loadAll()).length;
}

export function getRecentEntries(days: number = 90, fromDate: Date = new Date()): JournalEntry[] {
  const all = loadAll();
  const cutoff = new Date(fromDate);
  cutoff.setDate(cutoff.getDate() - days);
  return Object.values(all)
    .filter((e) => new Date(e.date) >= cutoff && new Date(e.date) <= fromDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// パーソナルデイ別の集計
export type PersonalDayStat = {
  count: number;
  totalMood: number;
  totalEnergy: number;
  avgMood: number;
  avgEnergy: number;
  hits: number;
  misses: number;
  hitRate: number;
};

export function aggregateByPersonalDay(
  entries: JournalEntry[],
  birth: string,
  personalDayFn: (birth: string, year: number, month: number, day: number) => number
): Record<number, PersonalDayStat> {
  const result: Record<number, PersonalDayStat> = {};
  for (let i = 1; i <= 9; i++) {
    result[i] = {
      count: 0,
      totalMood: 0,
      totalEnergy: 0,
      avgMood: 0,
      avgEnergy: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
    };
  }
  for (const e of entries) {
    const [y, m, d] = e.date.split("-").map(Number);
    const pd = personalDayFn(birth, y, m, d);
    const r = result[pd];
    if (!r) continue;
    r.count++;
    if (e.mood !== undefined) r.totalMood += e.mood;
    if (e.energy !== undefined) r.totalEnergy += e.energy;
    const fh = e.forecastHits;
    if (fh) {
      const types: (keyof NonNullable<JournalEntry["forecastHits"]>)[] = ["tarot", "iching", "daily", "synthesis"];
      for (const t of types) {
        if (fh[t] === "hit") r.hits++;
        else if (fh[t] === "miss") r.misses++;
      }
    }
  }
  for (const r of Object.values(result)) {
    if (r.count > 0) {
      r.avgMood = r.totalMood / r.count;
      r.avgEnergy = r.totalEnergy / r.count;
    }
    const total = r.hits + r.misses;
    r.hitRate = total > 0 ? r.hits / total : 0;
  }
  return result;
}

// 占断タイプ別の的中率
export type ForecastHitRate = {
  total: number;
  hits: number;
  misses: number;
  rate: number;
};

export function hitRatesByForecast(entries: JournalEntry[]): {
  tarot: ForecastHitRate;
  iching: ForecastHitRate;
  daily: ForecastHitRate;
  synthesis: ForecastHitRate;
} {
  const init = (): ForecastHitRate => ({ total: 0, hits: 0, misses: 0, rate: 0 });
  const result = {
    tarot: init(),
    iching: init(),
    daily: init(),
    synthesis: init(),
  };
  const types: (keyof typeof result)[] = ["tarot", "iching", "daily", "synthesis"];
  for (const e of entries) {
    if (!e.forecastHits) continue;
    for (const t of types) {
      const v = e.forecastHits[t];
      if (v === "hit") {
        result[t].hits++;
        result[t].total++;
      } else if (v === "miss") {
        result[t].misses++;
        result[t].total++;
      }
    }
  }
  for (const t of types) {
    result[t].rate = result[t].total > 0 ? result[t].hits / result[t].total : 0;
  }
  return result;
}

// 最近のストリーク（連続記録日数）
export function currentStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const key = dateKey(checkDate);
    const found = sorted.find((e) => e.date === key);
    if (found) streak++;
    else if (i === 0) continue; // skip today if not yet logged
    else break;
  }
  return streak;
}

// 香水使用統計
export function perfumeUsageStats(entries: JournalEntry[]): Record<string, { count: number; avgMood: number }> {
  const stats: Record<string, { count: number; totalMood: number; avgMood: number }> = {};
  for (const e of entries) {
    if (!e.perfumeUsed) continue;
    if (!stats[e.perfumeUsed]) stats[e.perfumeUsed] = { count: 0, totalMood: 0, avgMood: 0 };
    stats[e.perfumeUsed].count++;
    if (e.mood !== undefined) stats[e.perfumeUsed].totalMood += e.mood;
  }
  const result: Record<string, { count: number; avgMood: number }> = {};
  for (const [k, v] of Object.entries(stats)) {
    result[k] = { count: v.count, avgMood: v.count > 0 ? v.totalMood / v.count : 0 };
  }
  return result;
}
