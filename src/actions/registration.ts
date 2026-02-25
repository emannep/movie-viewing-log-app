
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registerMovie(formData: FormData) {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/login");
  const userId = userRes.user.id;

  const title = String(formData.get("title") ?? "").trim();
  const yearStr = String(formData.get("year") ?? "").trim();
  const status = String(formData.get("status") ?? "want_to_watch"); // watched / want_to_watch
  const memo = String(formData.get("memo") ?? "").trim();
  const watchedAtStr = String(formData.get("watched_at") ?? "").trim();

  if (!title) throw new Error("title is required");

  const year = yearStr ? Number(yearStr) : null;
  const watched_at =
    status === "watched" && watchedAtStr ? new Date(watchedAtStr).toISOString() : null;

  // 1) moviesに映画を用意（最小：title + year で探す）
  // ※将来 tmdb_id を使うなら、そっちをキーにするのが一番安全
  const { data: existing, error: findErr } = await supabase
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

  redirect("/movies");
}