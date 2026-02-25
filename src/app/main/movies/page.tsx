
import { createClient } from "@/lib/supabase/server"; 
import { redirect } from "next/navigation";

export default async function MoviesPage() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/login");

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
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("movies 取得エラー:", error);
  }

  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-bold">登録映画一覧</h1>

      {rows.length ? (
        <div className="space-y-3">
          {rows.map((row: any) => (
            <div key={row.id} className="rounded border p-3">
              <div className="font-semibold">
                {row.movies?.title} {row.movies?.year ? `(${row.movies.year}年)` : ""}
              </div>

              <div className="text-sm text-gray-700">状態: {row.status}</div>

              {row.watched_at && (
                <div className="text-sm text-gray-700">
                  視聴日: {new Date(row.watched_at).toLocaleDateString()}
                </div>
              )}

              {row.memo && <div className="mt-2 text-sm">{row.memo}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div>まだ登録された映画がありません！</div>
      )}
    </div>
  );

  /*return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">登録映画一覧</h2>

      {movies?.length ? (
        movies.map((movie) => (
          <div
            key={movie.id}
            className="rounded border p-3 text-sm leading-relaxed"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{movie.title}</span>
              {movie.year && (
                <span className="text-xs text-gray-500">
                  {movie.year}年
                </span>
              )}
              {movie.genres && (
                <span className="text-yellow-500">{movie.genres}</span>
              )}
            </div>

            <div className="text-red-900">
              {movie.status && `　/　${movie.status}`}
            </div>

            <div className="text-yellow-500">
              {movie.rating && `評価: ${movie.rating}`}
            </div>

            <div className="text-xs text-gray-500">
              {movie.memo && (
                <p className="mt-1 whitespace-pre-wrap">
                  メモのリンクアイコン/横線
                </p>
              )}
              {movie.watched_at && `視聴日: ${movie.watched_at}`}
              {movie.created_at && `　作製日: ${movie.created_at}`}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">
          まだ登録された映画がありません！
        </p>
      )}
    </div>
  );*/
}
