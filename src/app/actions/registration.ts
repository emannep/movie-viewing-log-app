
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAndUnlockCollections, getUnlockedGenres } from "./collections";
import { awardPoints } from "./points";

export async function registerMovie(formData: FormData) {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");
  const userId = userRes.user.id;

  const title = String(formData.get("title") ?? "").trim();
  const yearRaw = formData.get("year");
  const genresRaw = String(formData.get("genres") ?? "").trim();
  const status = String(formData.get("status") ?? "watched"); // watched / wishlist
  const ratingRaw = formData.get("rating");
  const createdAtStr = String(formData.get("created_at") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const watchedAtStr = String(formData.get("watched_at") ?? "").trim();

  const tmdbIdRaw = formData.get("tmdb_id");
  const posterPathStr = String(formData.get("poster_path") ?? "").trim();
  const tmdbVoteAverageRaw = formData.get("tmdb_vote_average");

  const tmdb_id = tmdbIdRaw ? Number(tmdbIdRaw) : null;
  const poster_path = posterPathStr || null;
  const tmdb_vote_average = tmdbVoteAverageRaw ? Number(tmdbVoteAverageRaw) : null;

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

  const genresArray =
    genresRaw === ""
      ? []  // 空なら空配列
      : genresRaw
          .split(/[、,]/)
          .map((g) => g.trim())
          .filter((g) => g.length > 0);

  let rating: number | null = null;
  if (status !== "wishlist" ) {
    if (ratingRaw !== null) {
      const parsedRating = Number(ratingRaw);
      if (!Number.isNaN(parsedRating)) {
        if (parsedRating < 1 || parsedRating > 5) {
          throw new Error("評価は 1〜5 の間で入力してください");
        }
      rating = parsedRating;
      }
    }
  }  

  const watched_at =
    status === "watched" && watchedAtStr ? new Date(watchedAtStr).toISOString() : null;

  const created_at = createdAtStr ? new Date(createdAtStr).toISOString() : null;

  try {
  
    // ※将来 tmdb_id を使う、そっちをキーにする 
    const { data, error } = await supabase.rpc("register_movie_data", {
      _title: title,
      _year: year,
      _genres: genresArray,
      _status: status,
      _rating: rating,
      _memo: memo,
      _watched_at: watched_at,
      _created_at: created_at,
      _poster_path: poster_path,
      _tmdb_id: tmdb_id,
      _tmdb_vote_average: tmdb_vote_average,
    });

    if (error) {
      console.error("movies 取得エラー:", error);
      throw new Error(error.message);
    }

    // 視聴済み登録のみポイント付与 & コレクション解放チェック
    if (status === "watched" && genresArray.length > 0) {
      const unlockedGenres = await getUnlockedGenres(userId);
      const isCollectionMovie = genresArray.some((g) => unlockedGenres.has(g));
      await Promise.all([
        awardPoints(userId, isCollectionMovie),
        checkAndUnlockCollections(userId, genresArray),
      ]);
    }

    revalidatePath("/main/movies");
    revalidatePath("/main/collection");
  } catch (e) {
    console.error("movies クエリ実行エラー:", e);
    throw e;
  }
  redirect("/main/movies");
}

export async function deleteMovie(id: string) {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  // 削除前に movie_id を取得しておく
  const { data: target, error: fetchErr } = await supabase
    .from("user_movies")
    .select("movie_id")
    .eq("id", id)
    .eq("user_id", userRes.user.id)
    .single();
  if (fetchErr || !target) throw new Error("対象の映画が見つかりません");

  const { error: deleteErr } = await supabase
    .from("user_movies")
    .delete()
    .eq("id", id)
    .eq("user_id", userRes.user.id);
  if (deleteErr) throw new Error(deleteErr.message);

  // 他のユーザーが同じ映画を登録していなければ movies からも削除
  const { count } = await supabase
    .from("user_movies")
    .select("id", { count: "exact", head: true })
    .eq("movie_id", target.movie_id);
  if (count === 0) {
    await supabase.from("movies").delete().eq("id", target.movie_id);
  }

  revalidatePath("/main/movies");
  revalidatePath("/main/collection");
}

export async function updateMovie(formData: FormData) {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");
  const userId = userRes.user.id;

  const id = String(formData.get("id"));
  const movie_id = String(formData.get("movie_id"));

  const title = String(formData.get("title") ?? "").trim();
  const yearRaw = formData.get("year");
  const genresRaw = String(formData.get("genres") ?? "").trim();
  const status = String(formData.get("status") ?? "watched");
  const ratingRaw = formData.get("rating");
  const createdAtStr = String(formData.get("created_at") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const watchedAtStr = String(formData.get("watched_at") ?? "").trim();

  const tmdbIdRaw = formData.get("tmdb_id");
  const posterPathStr = String(formData.get("poster_path") ?? "").trim();
  const tmdbVoteAverageRaw = formData.get("tmdb_vote_average");

  const tmdb_id = tmdbIdRaw ? Number(tmdbIdRaw) : null;
  const poster_path = posterPathStr || null;
  const tmdb_vote_average = tmdbVoteAverageRaw ? Number(tmdbVoteAverageRaw) : null;

  if (!title) throw new Error("タイトルは必須です");
  if (!yearRaw) throw new Error("年は必須です");
  
  const year = Number(yearRaw);
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 10;
  if (isNaN(year)) throw new Error("年は数値で入力してください");
  if (year < 1888 || year > maxYear) throw new Error(`年は 1888〜${maxYear} の間で入力してください`);

  const genresArray = genresRaw === "" ? [] : genresRaw.split(/[、,]/).map((g) => g.trim()).filter((g) => g.length > 0);

  let rating: number | null = null;
  if (status !== "wishlist" ) {
    if (ratingRaw !== null && ratingRaw !== "") {
      const parsedRating = Number(ratingRaw);
      if (!Number.isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        rating = parsedRating;
      }
    }
  }  

  const watched_at = status === "watched" && watchedAtStr ? new Date(watchedAtStr).toISOString() : null;
  const created_at = createdAtStr ? new Date(createdAtStr).toISOString() : null;

  try {
    const { error: moviesErr } = await supabase
      .from("movies")
      .update({ 
        title, 
        year, 
        genres: genresArray,
        tmdb_id,
        poster_path,
        tmdb_vote_average
      })
      .eq("id", movie_id);
    if (moviesErr) throw new Error(moviesErr.message);

    const { error: userMoviesErr } = await supabase
      .from("user_movies")
      .update({ status, memo: memo || null, watched_at, created_at })
      .eq("id", id);
    if (userMoviesErr) throw new Error(userMoviesErr.message);

    if (rating !== null) {
      const { error: reviewErr } = await supabase
        .from("user_reviews")
        .upsert({ user_id: userId, movie_id: movie_id, rating }, { onConflict: "user_id,movie_id" });
      if (reviewErr) throw new Error(reviewErr.message);
    } else {
      await supabase.from("user_reviews").delete().eq("user_id", userId).eq("movie_id", movie_id);
    }

    revalidatePath("/main/movies");
  } catch (e) {
    console.error("movies 更新エラー:", e);
    throw e;
  }
  redirect("/main/movies");
}
