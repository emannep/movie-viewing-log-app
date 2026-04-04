import React from 'react';
import Link from 'next/link';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/app/actions/recommend";
import { getUserCollections, type Collection } from "@/app/actions/collections";
import MainCarousel from "./MainCarousel";

const TMDB_IMG = "https://image.tmdb.org/t/p/w154";

function CollectionPreview({ collection }: { collection: Collection | null }) {
  const progress = collection && collection.movies.length > 0
    ? Math.round((collection.collectedCount / collection.movies.length) * 100)
    : 0;

  return (
    <Link href="/main/collection">
      <div className="bg-zinc-900/70 border border-amber-800/40 rounded-2xl p-4 shadow-inner shadow-black/30 active:opacity-80 transition-opacity">
        {/* セクションラベル */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/50" />
          <span className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">コレクション</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/50" />
        </div>

        {collection ? (
          <>
            {/* コレクション名 + 進捗 */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-amber-300 font-semibold text-sm">
                  {collection.decade}年代 {collection.genre}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {collection.collectedCount} / {collection.movies.length} 作品収集
                </p>
              </div>
              <span className="text-amber-400 text-lg font-bold">{progress}%</span>
            </div>

            {/* プログレスバー */}
            <div className="w-full h-1 bg-zinc-800 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* ポスター一覧（最大5枚） */}
            <div className="flex justify-center gap-x-6 w-full">
              {collection.movies.slice(0, 5).map((movie) => (
                <div
                  key={movie.tmdb_id}
                  className="relative shrink-0 w-16 h-[80px] rounded overflow-hidden border border-amber-900/30 bg-zinc-800"
                >
                  {movie.collected && movie.poster_path ? (
                    <img
                      src={`${TMDB_IMG}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {movie.collected ? (
                        <span className="text-amber-400 text-[9px] text-center px-0.5 leading-tight">
                          {movie.title}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-lg">?</span>
                      )}
                    </div>
                  )}
                  {movie.collected && (
                    <div className="absolute inset-0 ring-1 ring-amber-400/50 rounded pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 未解放状態 */
          <div className="flex flex-col items-center py-4 gap-2 text-center">
            <span className="text-3xl opacity-30">🏛️</span>
            <p className="text-zinc-400 text-xs">同じジャンルの映画を3本登録すると展示室が解放されます</p>
            <p className="text-amber-800/70 text-[10px] tracking-wide mt-1">展示室へ →</p>
          </div>
        )}
      </div>
    </Link>
  );
}

// 週シードによる決定論的シャッフル
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function MainPage() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const [recommendations, watchlistResult, collections] = await Promise.all([
    getRecommendations(6),
    supabase
      .from("user_movies")
      .select("id, movies(title, poster_path, tmdb_id)")
      .eq("status", "wishlist")
      .order("created_at", { ascending: false })
      .limit(50),
    getUserCollections(),
  ]);

  // 週番号シードで観たいリストをシャッフルし先頭10件を表示
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const allWatchlist = (watchlistResult.data ?? []).map((row: any) => ({
    id: row.id,
    movies: Array.isArray(row.movies) ? row.movies[0] : row.movies,
  }));
  const watchlist = seededShuffle(allWatchlist, weekSeed).slice(0, 10);

  // 進捗率が最も高いコレクションを優先表示
  const featuredCollection = collections.length > 0
    ? collections.reduce((best, c) =>
        c.collectedCount / Math.max(c.movies.length, 1) >=
        best.collectedCount / Math.max(best.movies.length, 1)
          ? c
          : best
      )
    : null;

  return (
    <div className="w-full flex flex-col gap-5 min-h-[calc(100dvh-6rem)]">

      {/* 館名プレート */}
      <header className="flex flex-col items-center pt-2">
        <div className="border border-amber-800/50 rounded-sm px-8 py-3 bg-amber-950/20 text-center shadow-inner shadow-amber-950/20">
          <p className="text-amber-700/80 text-[10px] tracking-[0.35em] uppercase mb-1">
            Film Museum
          </p>
          <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">
            みたろぐ
          </h1>
        </div>
      </header>

      {/* コレクション（メイン機能） */}
      <main>
      <CollectionPreview collection={featuredCollection} />
      </main>
      {/* おすすめ・観たいリスト（下部） */}
      <div className="mt-auto">
        <MainCarousel recommendations={recommendations} watchlist={watchlist} />
      </div>

    </div>
  );
}
