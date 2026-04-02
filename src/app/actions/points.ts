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
// ────────────────────────────────────────────────
export async function awardPoints(
  userId: string,
  isCollectionMovie: boolean
): Promise<void> {
  const supabase = await createClient();
  const points = isCollectionMovie ? 2 : 1;
  const seasonKey = getSeasonKey(new Date());

  const { data: existing } = await supabase
    .from("user_season_levels")
    .select("points")
    .eq("user_id", userId)
    .eq("season_key", seasonKey)
    .single();

  if (existing) {
    await supabase
      .from("user_season_levels")
      .update({ points: existing.points + points, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("season_key", seasonKey);
  } else {
    await supabase
      .from("user_season_levels")
      .insert({ user_id: userId, season_key: seasonKey, points });
  }
}

// ────────────────────────────────────────────────
// プロフィールページ用データ取得
// ────────────────────────────────────────────────
export type SeasonRecord = {
  seasonKey: string;
  seasonLabel: string;
  points: number;
  level: number;
  title: string;
};

export type CrownInfo = {
  rank: string;
  label: string;
  color: string;
  count: number;
  nextThreshold: number | null;
};

export type ProfileData = {
  currentSeason: SeasonRecord;
  seasonHistory: SeasonRecord[];
  seasonalCrown: CrownInfo;
  annualCrown: CrownInfo;
};

export async function getProfileData(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const userId = auth.user.id;
  const now = new Date();
  const seasonKey = getSeasonKey(now);

  const [{ data: seasonRows }, { data: watchedRows }] = await Promise.all([
    supabase
      .from("user_season_levels")
      .select("season_key, points")
      .eq("user_id", userId)
      .order("season_key", { ascending: false }),
    supabase
      .from("user_movies")
      .select("watched_at")
      .eq("user_id", userId)
      .eq("status", "watched")
      .not("watched_at", "is", null),
  ]);

  const allSeasons: SeasonRecord[] = (seasonRows ?? []).map((r) => {
    const level = calcLevel(r.points);
    return {
      seasonKey: r.season_key,
      seasonLabel: getSeasonLabel(r.season_key),
      points: r.points,
      level,
      title: LEVEL_TITLES[level],
    };
  });

  const currentSeasonRow = allSeasons.find((s) => s.seasonKey === seasonKey);
  const currentSeason: SeasonRecord = currentSeasonRow ?? {
    seasonKey,
    seasonLabel: getSeasonLabel(seasonKey),
    points: 0,
    level: 0,
    title: LEVEL_TITLES[0],
  };

  const seasonHistory = allSeasons.filter((s) => s.seasonKey !== seasonKey);

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
    currentSeason,
    seasonHistory,
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
