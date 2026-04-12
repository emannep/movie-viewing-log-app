// シーズンキー・レベル・王冠の計算ユーティリティ（"use server"不要）

// ────────────────────────────────────────────────
// シーズンキー
// 春: 3〜5月 / 夏: 6〜8月 / 秋: 9〜11月 / 冬: 12〜2月
// 冬は12月を起点年とする（例: 2025-12 〜 2026-02 = "2025-winter"）
// ────────────────────────────────────────────────
export function getSeasonKey(date: Date): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 3 && month <= 5) return `${year}-spring`;
  if (month >= 6 && month <= 8) return `${year}-summer`;
  if (month >= 9 && month <= 11) return `${year}-fall`;
  const seasonYear = month === 12 ? year : year - 1;
  return `${seasonYear}-winter`;
}

export function getSeasonLabel(key: string): string {
  const labels: Record<string, string> = {
    spring: "春",
    summer: "夏",
    fall: "秋",
    winter: "冬",
  };
  const [year, season] = key.split("-");
  return `${year}年 ${labels[season] ?? season}`;
}

export function getSeasonRange(date: Date): { start: Date; end: Date } {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 3 && month <= 5)
    return { start: new Date(year, 2, 1), end: new Date(year, 4, 31) };
  if (month >= 6 && month <= 8)
    return { start: new Date(year, 5, 1), end: new Date(year, 7, 31) };
  if (month >= 9 && month <= 11)
    return { start: new Date(year, 8, 1), end: new Date(year, 10, 30) };
  if (month === 12)
    return { start: new Date(year, 11, 1), end: new Date(year + 1, 2, 1) };
  return { start: new Date(year - 1, 11, 1), end: new Date(year, 2, 1) };
}

// レベル: 10ポイントごとに1上昇（上限なし）
export function calcLevel(points: number): number {
  return Math.floor(points / 10);
}

// 称号: 2レベルごとに変更
export const LEVEL_TITLES = [
  "映画見習い",         // Lv 0〜1
  "映画ファン",         // Lv 2〜3
  "映画通",             // Lv 4〜5
  "シネフィル",         // Lv 6〜7
  "映画評論家見習い",   // Lv 8〜9
  "映画評論家",         // Lv 10〜11
  "映画批評家",         // Lv 12〜13
  "映画プロデューサー", // Lv 14〜15
  "映画監督",           // Lv 16〜17
  "映画の神様",         // Lv 18〜19
  "映画の伝説",         // Lv 20〜
];

export function calcTitle(level: number): string {
  const index = Math.min(Math.floor(level / 2), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

// ────────────────────────────────────────────────
// 王冠
// ────────────────────────────────────────────────
export type CrownRank = "none" | "bronze" | "silver" | "gold" | "platinum";

export const SEASON_THRESHOLDS = { bronze: 3, silver: 9, gold: 12, platinum: 15 };
export const ANNUAL_THRESHOLDS = { bronze: 10, silver: 30, gold: 40, platinum: 60 };

export function calcCrownRank(count: number, type: "season" | "annual"): CrownRank {
  const t = type === "season" ? SEASON_THRESHOLDS : ANNUAL_THRESHOLDS;
  if (count >= t.platinum) return "platinum";
  if (count >= t.gold) return "gold";
  if (count >= t.silver) return "silver";
  if (count >= t.bronze) return "bronze";
  return "none";
}

// ランクの強さ順（比較用）
const RANK_ORDER: Record<CrownRank, number> = {
  none: 0, bronze: 1, silver: 2, gold: 3, platinum: 4,
};
function maxRank(a: CrownRank, b: CrownRank): CrownRank {
  return RANK_ORDER[a] >= RANK_ORDER[b] ? a : b;
}

// 絶対評価とパーセンタイル評価の「いいとこ取り」
// - ユーザー少数時: 絶対閾値が保証として機能（頑張った人を守る）
// - ユーザー多数時: パーセンタイルが相対評価として機能
// allCounts: 対象期間に1本以上視聴した全ユーザーの本数リスト
export function calcCrownRankByPercentile(
  count: number,
  allCounts: number[],
  type: "season" | "annual"
): { rank: CrownRank; percentile: number | null } {
  if (count === 0) return { rank: "none", percentile: null };

  // 絶対ランク（固定閾値）
  const absoluteRank = calcCrownRank(count, type);

  // パーセンタイルランク（他ユーザーとの比較）
  if (allCounts.length === 0) return { rank: absoluteRank, percentile: null };

  const below = allCounts.filter((v) => v < count).length;
  const equal = allCounts.filter((v) => v === count).length;
  const percentile = (below + equal / 2) / allCounts.length; // 0〜1（1が上位）、同率は中間点で計算

  let percentileRank: CrownRank;
  if (percentile >= 0.95) percentileRank = "platinum";
  else if (percentile >= 0.85) percentileRank = "gold";
  else if (percentile >= 0.70) percentileRank = "silver";
  else if (percentile >= 0.50) percentileRank = "bronze";
  else percentileRank = "none";

  // 高い方を採用
  return { rank: maxRank(absoluteRank, percentileRank), percentile };
}

export function nextThreshold(
  count: number,
  t: typeof SEASON_THRESHOLDS
): number | null {
  if (count < t.bronze) return t.bronze;
  if (count < t.silver) return t.silver;
  if (count < t.gold) return t.gold;
  if (count < t.platinum) return t.platinum;
  return null;
}

export const CROWN_LABELS: Record<CrownRank, string> = {
  none: "",
  bronze: "ブロンズ",
  silver: "シルバー",
  gold: "ゴールド",
  platinum: "プラチナ",
};

export const CROWN_COLORS: Record<CrownRank, string> = {
  none: "",
  bronze: "text-amber-600",
  silver: "text-slate-300",
  gold: "text-yellow-400",
  platinum: "text-cyan-200",
};

// SVGアイコン用のfill/stroke色
export const CROWN_ICON_COLORS: Record<CrownRank, { fill: string; stroke: string }> = {
  none:     { fill: "transparent",  stroke: "transparent" },
  bronze:   { fill: "#CD7F32",      stroke: "#A0522D" },
  silver:   { fill: "#C0C0C0",      stroke: "#909090" },
  gold:     { fill: "#FFD700",      stroke: "#DAA520" },
  platinum: { fill: "#E8F5FF",      stroke: "#90CDF4" },
};
