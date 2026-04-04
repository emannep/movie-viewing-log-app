"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getSeasonKey,
  getSeasonLabel,
  getSeasonRange,
  calcLevel,
  calcCrownRank,
  nextThreshold,
  LEVEL_TITLES,
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
  const title = LEVEL_TITLES[level];

  const movies = watchedRows ?? [];

  // シーズン王冠
  const { start, end } = getSeasonRange(now);
  const seasonCount = movies.filter((m) => {
    const d = new Date(m.watched_at!);
    return d >= start && d <= end;
  }).length;
  const seasonRank = calcCrownRank(seasonCount, "season");

  // 年間王冠
  const currentYear = now.getFullYear();
  const annualCount = movies.filter(
    (m) => new Date(m.watched_at!).getFullYear() === currentYear
  ).length;
  const annualRank = calcCrownRank(annualCount, "annual");

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
    },
    annualCrown: {
      rank: annualRank,
      label: CROWN_LABELS[annualRank],
      color: CROWN_COLORS[annualRank],
      count: annualCount,
      nextThreshold: nextThreshold(annualCount, ANNUAL_THRESHOLDS),
    },
  };
}
