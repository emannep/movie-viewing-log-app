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
    return { start: new Date(year, 11, 1), end: new Date(year + 1, 1, 28) };
  return { start: new Date(year - 1, 11, 1), end: new Date(year, 1, 28) };
}

// レベル: 5ポイントごとに1上昇、上限10
export function calcLevel(points: number): number {
  return Math.min(Math.floor(points / 5), 10);
}

export const LEVEL_TITLES = [
  "映画見習い",       // Lv 0
  "映画ファン",       // Lv 1
  "映画通",           // Lv 2
  "シネフィル",       // Lv 3
  "映画評論家見習い", // Lv 4
  "映画評論家",       // Lv 5
  "映画批評家",       // Lv 6
  "映画プロデューサー", // Lv 7
  "映画監督",         // Lv 8
  "映画の神様",       // Lv 9
  "映画の伝説",       // Lv 10
];

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
