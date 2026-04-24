import React from 'react';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/app/actions/recommend";
import { getUserCollections } from "@/app/actions/collections";
import MainCarousel from "./MainCarousel";
import HomeCollectionSection from "./HomeCollectionSection";

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

  return (
    <div className="w-full flex flex-col gap-3">

      {/* 館名プレート */}
      <header className="flex flex-col items-center pt-2">
        <div className="border border-amber-800/50 rounded-sm px-8 py-2.5 bg-amber-950/20 text-center shadow-inner shadow-amber-950/20">
          <p className="text-amber-700/80 text-base tracking-[0.35em] uppercase mb-0.5">
            Film Museum
          </p>
          <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">
            あなたの映画博物館
          </h1>
        </div>
      </header>

      {/* コレクション（最大2つ・展示室から選択） */}
      <HomeCollectionSection collections={collections} />

      {/* おすすめ・観たいリスト */}
      <div className="mt-auto">
        <MainCarousel recommendations={recommendations} watchlist={watchlist} />
      </div>

    </div>
  );
}
