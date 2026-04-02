import React from 'react';
import Link from 'next/link';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/app/actions/recommend";
import MainCarousel from "./MainCarousel";

export default async function MainPage() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const [recommendations, watchlistResult] = await Promise.all([
    getRecommendations(6),
    supabase
      .from("user_movies")
      .select("id, movies(title, poster_path)")
      .eq("status", "wishlist")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const watchlist = (watchlistResult.data ?? []).map((row: any) => ({
    id: row.id,
    movies: Array.isArray(row.movies) ? row.movies[0] : row.movies,
  }));

  return (
    <div className="w-full rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
      <div className="px-8 pt-4 pb-6">

        <header className="mb-4 text-orange-300">
          <h1 className="flex justify-center">みたろぐ</h1>
          <link rel="canonical" href="/main" />
        </header>

        <main className="flex flex-col items-center justify-center w-full gap-6">
          <MainCarousel recommendations={recommendations} watchlist={watchlist} />

          <div className="grid grid-cols-2 text-center w-full gap-4">
            <Link className="p-4 bg-red-900 rounded-2xl" href="/main/registration">
              映画登録
            </Link>
            <Link className="p-4 bg-red-900 rounded-2xl" href="/main/movies">
              映画一覧・編集
            </Link>
            <Link className="p-4 bg-red-900 rounded-2xl" href="/main/collection">
              🏛️ コレクション
            </Link>
            <Link className="p-4 bg-red-900 rounded-2xl" href="/main/profile">
              プロフィール
            </Link>
          </div>
        </main>

        <footer>
          <p>Copyright © 2026 My Website</p>
        </footer>

      </div>
    </div>
  );
}
