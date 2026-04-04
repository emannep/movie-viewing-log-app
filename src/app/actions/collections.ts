"use server";

import { createClient } from "@/lib/supabase/server";
import { GENRE_ID_MAP } from "@/lib/genre-map";

export type CollectionMovie = {
  tmdb_id: number;
  title: string;
  year: string;
  poster_path: string | null;
  rank: number;
  collected: boolean;
};

export type Collection = {
  genre: string;
  decade: number;
  unlockedAt: string;
  movies: CollectionMovie[];
  collectedCount: number;
  roomIndex: number;
};

/** TMDB から指定ジャンル×年代の上位5作品を取得 */
async function fetchTmdbTop5(genre: string, decade: number): Promise<Omit<CollectionMovie, "collected">[]> {
  const genreId = GENRE_ID_MAP[genre];
  if (!genreId) return [];

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("with_genres", String(genreId));
  url.searchParams.set("sort_by", "vote_average.desc");
  url.searchParams.set("vote_count.gte", "100");
  url.searchParams.set("primary_release_date.gte", `${decade}-01-01`);
  url.searchParams.set("primary_release_date.lte", `${decade + 9}-12-31`);
  url.searchParams.set("language", "ja-JP");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results ?? []).slice(0, 5).map((m: any, i: number) => ({
    tmdb_id: m.id,
    title: m.title,
    year: m.release_date?.substring(0, 4) ?? "",
    poster_path: m.poster_path ?? null,
    rank: i + 1,
  }));
}

/**
 * 映画登録後に呼び出す。
 * 新しいコレクションが解放された場合はそのリストを返す。
 */
export async function checkAndUnlockCollections(
  userId: string,
  genres: string[]
): Promise<{ genre: string; decade: number }[]> {
  const supabase = await createClient();
  const newlyUnlocked: { genre: string; decade: number }[] = [];

  // TMDBマッピングのあるジャンルのみ対象
  const validGenres = genres.filter((g) => GENRE_ID_MAP[g]);
  if (validGenres.length === 0) return [];

  // 必要なデータを並列取得
  const [
    { count: totalUnlocked },
    { data: watchedRows },
    { data: allProgress },
    { data: allExisting },
  ] = await Promise.all([
    supabase
      .from("user_unlocked_collections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_movies")
      .select("movies(genres, year)")
      .eq("user_id", userId)
      .eq("status", "watched"),
    supabase
      .from("user_genre_progress")
      .select("genre, next_unlock_at")
      .eq("user_id", userId)
      .in("genre", validGenres),
    supabase
      .from("user_unlocked_collections")
      .select("genre, decade")
      .eq("user_id", userId)
      .in("genre", validGenres),
  ]);

  let currentTotal = totalUnlocked ?? 0;

  const watchedMovies = (watchedRows ?? []).map((row: any) =>
    Array.isArray(row.movies) ? row.movies[0] : row.movies
  );

  const progressMap = new Map((allProgress ?? []).map((p) => [p.genre, p.next_unlock_at]));
  const existingByGenre = new Map<string, Set<number>>();
  for (const e of allExisting ?? []) {
    if (!existingByGenre.has(e.genre)) existingByGenre.set(e.genre, new Set());
    existingByGenre.get(e.genre)!.add(e.decade);
  }

  for (const genre of validGenres) {
    const genreMovies = watchedMovies.filter(
      (m: any) => m?.genres?.includes(genre)
    );
    const genreCount = genreMovies.length;

    const nextUnlockAt = progressMap.get(genre) ?? 3;

    if (genreCount < nextUnlockAt) continue;

    const unlockedDecades = existingByGenre.get(genre) ?? new Set<number>();

    // このジャンルで最も映画が多い未解放の年代を決定
    const decadeCount: Record<number, number> = {};
    for (const m of genreMovies) {
      if (m?.year) {
        const decade = Math.floor(m.year / 10) * 10;
        if (!unlockedDecades.has(decade)) {
          decadeCount[decade] = (decadeCount[decade] ?? 0) + 1;
        }
      }
    }

    const bestEntry = Object.entries(decadeCount).sort(([, a], [, b]) => b - a)[0];
    if (!bestEntry) continue;

    const decade = Number(bestEntry[0]);

    // コレクション解放
    const { error } = await supabase.from("user_unlocked_collections").insert({
      user_id: userId,
      genre,
      decade,
    });

    if (error) continue;

    newlyUnlocked.push({ genre, decade });
    currentTotal += 1;

    // 次の解放本数を更新（解放後の総数でしきい値を判断）
    const newThreshold = currentTotal >= 5 ? 5 : 3;
    await supabase.from("user_genre_progress").upsert(
      { user_id: userId, genre, next_unlock_at: genreCount + newThreshold },
      { onConflict: "user_id,genre" }
    );
  }

  return newlyUnlocked;
}

/** ユーザーの解放済みコレクション一覧を取得（ギャラリーページ用） */
export async function getUserCollections(): Promise<Collection[]> {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const [{ data: unlocked }, { data: watchedRows }] = await Promise.all([
    supabase
      .from("user_unlocked_collections")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("unlocked_at", { ascending: true }),
    supabase
      .from("user_movies")
      .select("movies(tmdb_id)")
      .eq("user_id", auth.user.id)
      .eq("status", "watched"),
  ]);

  if (!unlocked || unlocked.length === 0) return [];

  const watchedTmdbIds = new Set(
    (watchedRows ?? [])
      .map((row: any) => {
        const m = Array.isArray(row.movies) ? row.movies[0] : row.movies;
        return m?.tmdb_id;
      })
      .filter(Boolean)
  );

  // 部屋割り当て: 1個目 → room 0、4個目以降は3個ごとに +1
  function getRoomIndex(collectionIndex: number): number {
    if (collectionIndex === 0) return 0;
    return Math.floor((collectionIndex - 1) / 3) + 1;
  }

  const collections = await Promise.all(
    unlocked.map(async (c, i) => {
      const tmdbMovies = await fetchTmdbTop5(c.genre, c.decade);
      const movies: CollectionMovie[] = tmdbMovies.map((m) => ({
        ...m,
        collected: watchedTmdbIds.has(m.tmdb_id),
      }));
      return {
        genre: c.genre,
        decade: c.decade,
        unlockedAt: c.unlocked_at,
        movies,
        collectedCount: movies.filter((m) => m.collected).length,
        roomIndex: getRoomIndex(i),
      };
    })
  );

  return collections;
}

/** ユーザーが解放しているジャンルの Set を返す（ポイント計算用） */
export async function getUnlockedGenres(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_unlocked_collections")
    .select("genre")
    .eq("user_id", userId);
  return new Set((data ?? []).map((c: any) => c.genre));
}
