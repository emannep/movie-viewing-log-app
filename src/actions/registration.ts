
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registerMovie(formData: FormData) {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/login");
  const userId = userRes.user.id;

  const title = String(formData.get("title") ?? "").trim();
  const yearRaw = formData.get("year");
  const status = String(formData.get("status") ?? " watched / want_to_watch"); // watched / want_to_watch
  const memo = String(formData.get("memo") ?? "").trim();
  const watchedAtStr = String(formData.get("watched_at") ?? "").trim();

  if (!title) {
    throw new Error("タイトルは必須です");
  }
  
  if (!yearRaw) {
    throw new Error("年は必須です");
  }
  const year = Number(yearRaw);
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 10;
  if (isNaN(year)) {
    throw new Error("年は数値で入力してください");
  }
  if (year < 1888 || year > maxYear) {
    throw new Error(`年は 1888〜${maxYear} の間で入力してください`);
  }

  const watched_at =
    status === "watched" && watchedAtStr ? new Date(watchedAtStr).toISOString() : null;

  try {
  
    // 1) moviesに映画を用意（最小：title + year で探す）
    // ※将来 tmdb_id を使うなら、そっちをキーにするのが一番安全 
    const { data, error } = await supabase.rpc("register_movie_data", {
      _title: title,
      _year: year,
      _status: status,
      _memo: memo,
      _watched_at: watched_at,
    });

    if (error) {
      console.error("movies 取得エラー:", error);
    throw new Error(error.message);
    }
    return data;
  } catch (e) {
    console.error("movies クエリ実行エラー:", e);
    throw e;
  }
}

  /*const { data: existing, error: findErr } = await supabase
    .from("movies")
    .select("id")
    .eq("title", title)
    .eq("year", year)
    .maybeSingle();

  if (findErr) throw new Error(findErr.message);

  let movieId = existing?.id as string | undefined;

  if (!movieId) {
    const { data: inserted, error: insErr } = await supabase
      .from("movies")
      .insert({ title, year })
      .select("id")
      .single();

    if (insErr) throw new Error(insErr.message);
    movieId = inserted.id;
  }

  // 2) user_moviesを upsert（同じ user_id + movie_id があれば更新）
  const { error: upsertErr } = await supabase
    .from("user_movies")
    .upsert(
      {
        user_id: userId,
        movie_id: movieId,
        status,
        memo: memo || null,
        watched_at, // watched の時だけ入る
      },
      { onConflict: "user_id,movie_id" }
    );

  if (upsertErr) throw new Error(upsertErr.message);
  redirect("/movies");*/
