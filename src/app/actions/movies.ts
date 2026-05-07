
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function movieAction() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("user_movies")
    .select(`
      id,
      status,
      memo,
      watched_at,
      created_at,
      movies (
        id,
        title,
        year,
        genres,
        tmdb_id,
        imdb_id,
        poster_path,
        tmdb_vote_average
      ),
      user_reviews (
        rating
      )
    `)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("movies 取得エラー:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }
  const rows = (data ?? []).map((row: any) => ({
    ...row,
    movies: Array.isArray(row.movies) ? row.movies[0] : row.movies,
    user_reviews: Array.isArray(row.user_reviews) ? row.user_reviews[0] ?? null : row.user_reviews,
  })) as any;
  return rows;

}

