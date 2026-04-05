"use server";

import { createClient } from "@/lib/supabase/server";
import { GENRE_ID_MAP } from "@/lib/genre-map";

export type RecommendedMovie = {
  tmdb_id: number;
  title: string;
  year: string;
  poster_path: string | null;
  tmdb_vote_average: number;
};

export async function getRecommendations(limit = 12): Promise<RecommendedMovie[]> {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data: userMovies } = await supabase
    .from("user_movies")
    .select(`
      status,
      movies (genres, tmdb_id),
      user_reviews (rating)
    `);

  if (!userMovies || userMovies.length === 0) return [];

  const genreCount: Record<string, number> = {};
  const registeredTmdbIds = new Set<number>();

  for (const row of userMovies) {
    const movie = Array.isArray(row.movies) ? row.movies[0] : (row.movies as any);
    const review = Array.isArray(row.user_reviews) ? row.user_reviews[0] : (row.user_reviews as any);

    if (movie?.tmdb_id) registeredTmdbIds.add(movie.tmdb_id);

    if (row.status === "watched" && (review?.rating ?? 0) >= 4 && movie?.genres) {
      for (const g of movie.genres) {
        genreCount[g] = (genreCount[g] ?? 0) + 1;
      }
    }
  }

  // 高評価映画がなければ視聴済み全ジャンルにフォールバック
  if (Object.keys(genreCount).length === 0) {
    for (const row of userMovies) {
      if (row.status !== "watched") continue;
      const movie = Array.isArray(row.movies) ? row.movies[0] : (row.movies as any);
      if (movie?.genres) {
        for (const g of movie.genres) {
          genreCount[g] = (genreCount[g] ?? 0) + 1;
        }
      }
    }
  }

  const topGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  const tmdbGenreIds = topGenres.map((g) => GENRE_ID_MAP[g]).filter(Boolean);
  if (tmdbGenreIds.length === 0) return [];

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  // 週番号（エポックからの週数）でページをローテーション（1〜5ページ）
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const page = (weekNumber % 5) + 1;

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("with_genres", tmdbGenreIds.join("|"));
  url.searchParams.set("sort_by", "vote_average.desc");
  url.searchParams.set("vote_count.gte", "500");
  url.searchParams.set("language", "ja-JP");
  url.searchParams.set("page", String(page));

  // キャッシュを1週間に設定
  const res = await fetch(url.toString(), { next: { revalidate: 7 * 24 * 60 * 60 } });
  if (!res.ok) return [];

  const data = await res.json();

  return (data.results ?? [])
    .filter((m: any) => !registeredTmdbIds.has(m.id))
    .slice(0, limit)
    .map((m: any) => ({
      tmdb_id: m.id,
      title: m.title,
      year: m.release_date?.substring(0, 4) ?? "",
      poster_path: m.poster_path ?? null,
      tmdb_vote_average: m.vote_average,
    }));
}
