"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getSeasonRange,
  calcLevel,
  calcTitle,
  calcCrownRankByPercentile,
  nextThreshold,
  SEASON_THRESHOLDS,
  ANNUAL_THRESHOLDS,
  CROWN_LABELS,
  CROWN_COLORS,
} from "@/lib/points-utils";

export type { CrownRank } from "@/lib/points-utils";

// ────────────────────────────────────────────────
// ポイント付与（映画登録時に呼び出す）
// user_points テーブルに累計で upsert する
// ────────────────────────────────────────────────
export async function awardPoints(
  userId: string,
  isCollectionMovie: boolean
): Promise<void> {
  const supabase = await createClient();
  const points = isCollectionMovie ? 2 : 1;

  const { data: existing } = await supabase
    .from("user_points")
    .select("total_points")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase
      .from("user_points")
      .update({
        total_points: existing.total_points + points,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("user_points")
      .insert({ user_id: userId, total_points: points });
  }
}

// ────────────────────────────────────────────────
// プロフィールページ用データ取得
// ────────────────────────────────────────────────
export type CrownInfo = {
  rank: string;
  label: string;
  color: string;
  count: number;
  nextThreshold: number | null;
  percentile: number | null; // 0〜1（1が上位）、null=データ不足
};

export type ProfileData = {
  totalPoints: number;
  level: number;
  title: string;
  seasonalCrown: CrownInfo;
  annualCrown: CrownInfo;
};

export async function getProfileData(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const userId = auth.user.id;
  const now = new Date();

  const [{ data: pointsRow }, { data: watchedRows }] = await Promise.all([
    supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("user_movies")
      .select("watched_at")
      .eq("user_id", userId)
      .eq("status", "watched")
      .not("watched_at", "is", null),
  ]);

  const totalPoints = pointsRow?.total_points ?? 0;
  const level = calcLevel(totalPoints);
  const title = calcTitle(level);

  const movies = watchedRows ?? [];
  const { start, end } = getSeasonRange(now);
  const currentYear = now.getFullYear();

  // 自分の視聴数
  const seasonCount = movies.filter((m) => {
    const d = new Date(m.watched_at!);
    return d >= start && d <= end;
  }).length;
  const annualCount = movies.filter(
    (m) => new Date(m.watched_at!).getFullYear() === currentYear
  ).length;

  // 他ユーザーの視聴数（パーセンタイル計算用）
  const [{ data: allSeasonRows }, { data: allAnnualRows }] = await Promise.all([
    supabase
      .from("user_movies")
      .select("user_id")
      .eq("status", "watched")
      .not("watched_at", "is", null)
      .gte("watched_at", start.toISOString())
      .lte("watched_at", end.toISOString()),
    supabase
      .from("user_movies")
      .select("user_id")
      .eq("status", "watched")
      .not("watched_at", "is", null)
      .gte("watched_at", `${currentYear}-01-01`)
      .lt("watched_at", `${currentYear + 1}-01-01`),
  ]);

  function countsByUser(rows: { user_id: string }[] | null): number[] {
    if (!rows) return [];
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.user_id] = (map[r.user_id] ?? 0) + 1;
    }
    return Object.values(map);
  }

  const allSeasonCounts = countsByUser(allSeasonRows);
  const allAnnualCounts = countsByUser(allAnnualRows);

  const { rank: seasonRank, percentile: seasonPercentile } =
    calcCrownRankByPercentile(seasonCount, allSeasonCounts, "season");
  const { rank: annualRank, percentile: annualPercentile } =
    calcCrownRankByPercentile(annualCount, allAnnualCounts, "annual");

  return {
    totalPoints,
    level,
    title,
    seasonalCrown: {
      rank: seasonRank,
      label: CROWN_LABELS[seasonRank],
      color: CROWN_COLORS[seasonRank],
      count: seasonCount,
      nextThreshold: nextThreshold(seasonCount, SEASON_THRESHOLDS),
      percentile: seasonPercentile,
    },
    annualCrown: {
      rank: annualRank,
      label: CROWN_LABELS[annualRank],
      color: CROWN_COLORS[annualRank],
      count: annualCount,
      nextThreshold: nextThreshold(annualCount, ANNUAL_THRESHOLDS),
      percentile: annualPercentile,
    },
  };
}
