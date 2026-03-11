//映画登録用の Server Action（"use server"）

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
        imdb_id
      )
      user_reviews (
        rating,
        review
    `)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("movies 取得エラー:", error);
  }
  
  const rows = data ?? [];
  return rows;

}

/*
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
*/

/*
const MovieSchema = z.object({
  title: z.string().min(1),
  original_title: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  poster_url: z.string().url().optional().nullable(),
  tmdb_id: z.coerce.number().int().optional().nullable(),
  imdb_id: z.string().optional().nullable(),
});
export async function deleteMovie(movieId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("movies").delete().eq("id", movieId);
  if (error) throw new Error(error.message);

  redirect("/movies");
}

const parsed = MovieSchema.safeParse({
  title: formData.get("title"),
  original_title: formData.get("original_title"),
  year: formData.get("year"),
  poster_url: formData.get("poster_url"),
  tmdb_id: formData.get("tmdb_id"),
  imdb_id: formData.get("imdb_id"),
});
if (!parsed.success) throw new Error(parsed.error.message);

  redirect(`/movies/${data.id}`);
*/
