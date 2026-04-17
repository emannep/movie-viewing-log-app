export const GENRES: { name: string; tmdbId: number }[] = [
  { name: "その他・不明",     tmdbId: 0 },
  { name: "アクション",       tmdbId: 28 },
  { name: "アドベンチャー",   tmdbId: 12 },
  { name: "アニメーション",   tmdbId: 16 },
  { name: "コメディ",         tmdbId: 35 },
  { name: "犯罪",             tmdbId: 80 },
  { name: "ドキュメンタリー", tmdbId: 99 },
  { name: "ドラマ",           tmdbId: 18 },
  { name: "ファミリー",       tmdbId: 10751 },
  { name: "ファンタジー",     tmdbId: 14 },
  { name: "歴史",             tmdbId: 36 },
  { name: "ホラー",           tmdbId: 27 },
  { name: "音楽",             tmdbId: 10402 },
  { name: "ミステリー",       tmdbId: 9648 },
  { name: "ロマンス",         tmdbId: 10749 },
  { name: "SF",               tmdbId: 878 },
  { name: "スリラー",         tmdbId: 53 },
  { name: "戦争",             tmdbId: 10752 },
  { name: "西部劇",           tmdbId: 37 },
];

export const GENRE_ID_MAP: Record<string, number> =
  Object.fromEntries(GENRES.map((g) => [g.name, g.tmdbId]));
