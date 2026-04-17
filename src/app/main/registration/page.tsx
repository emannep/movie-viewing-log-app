
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "./registerForm";
import { GENRES } from "@/lib/genre-map";

export default async function RegisterPage(props: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const editId = searchParams?.editId;

  let initialData = undefined;
  if (editId) {
    const { data: movieData, error: movieError } = await supabase
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
      .eq("id", editId)
      .single();

    if (!movieError && movieData) {
      initialData = {
        ...movieData,
        movies: Array.isArray(movieData.movies) ? movieData.movies[0] : movieData.movies,
        user_reviews: Array.isArray(movieData.user_reviews) ? movieData.user_reviews[0] : movieData.user_reviews
      };
    } else if (movieError) {
      console.error(movieError);
    }
  }

  return <RegisterForm genres={GENRES} initialData={initialData} />;
}
