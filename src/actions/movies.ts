//映画登録用の Server Action（"use server"）
//`revalidatePath` のパスは、実際のルーティング（`/app/movies` なのか `/movies` なのか）に合わせてください。


"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MovieSchema = z.object({
  title: z.string().min(1),
  original_title: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  poster_url: z.string().url().optional().nullable(),
  tmdb_id: z.coerce.number().int().optional().nullable(),
  imdb_id: z.string().optional().nullable(),
});

export async function createMovie(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const parsed = MovieSchema.safeParse({
    title: formData.get("title"),
    original_title: formData.get("original_title"),
    year: formData.get("year"),
    poster_url: formData.get("poster_url"),
    tmdb_id: formData.get("tmdb_id"),
    imdb_id: formData.get("imdb_id"),
  });
  if (!parsed.success) throw new Error(parsed.error.message);

  const { data, error } = await supabase
    .from("movies")
    .insert({
      ...parsed.data,
      created_by: auth.user.id, // RLSで update/delete を守る用
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/movies/${data.id}`);
}

export async function updateMovie(movieId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();

  const parsed = MovieSchema.safeParse({
    title: formData.get("title"),
    original_title: formData.get("original_title"),
    year: formData.get("year"),
    poster_url: formData.get("poster_url"),
    tmdb_id: formData.get("tmdb_id"),
    imdb_id: formData.get("imdb_id"),
  });
  if (!parsed.success) throw new Error(parsed.error.message);

  const { error } = await supabase
    .from("movies")
    .update(parsed.data)
    .eq("id", movieId);

  if (error) throw new Error(error.message);
}

export async function deleteMovie(movieId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("movies").delete().eq("id", movieId);
  if (error) throw new Error(error.message);

  redirect("/movies");
}
src/actions/userMovies.ts

"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UpsertSchema = z.object({
  movie_id: z.string().uuid(),
  status: z.enum(["watched", "watchlist"]),
  watched_at: z.string().optional().nullable(), // yyyy-mm-dd
  memo: z.string().optional().nullable(),
});

export async function upsertUserMovie(input: unknown) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const parsed = UpsertSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { movie_id, status, watched_at, memo } = parsed.data;

  const { error } = await supabase.from("user_movies").upsert(
    {
      user_id: auth.user.id,
      movie_id,
      status,
      watched_at: status === "watched" ? watched_at ?? null : null,
      memo: memo ?? null,
    },
    { onConflict: "user_id,movie_id" }
  );

  if (error) throw new Error(error.message);
}
src/actions/reviews.ts

"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ReviewSchema = z.object({
  movie_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().optional().nullable(),
});

export async function upsertReview(input: unknown) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: auth.user.id,
      ...parsed.data,
      body: parsed.data.body ?? null,
    },
    { onConflict: "user_id,movie_id" }
  );

  if (error) throw new Error(error.message);
}
