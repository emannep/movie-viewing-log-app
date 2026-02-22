
import { createClient } from "@/lib/supabase/server"; 
//import { registerMovie } from "@/actions/movies";
import { redirect } from "next/navigation";

export default async function MoviesPage() {
  const supabase = await createClient();

  /*let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (e) {
    console.error("auth.getUser エラー:", e);
    return (
      <div className="p-4 text-red-600">
        ユーザー情報の取得に失敗しました。
      </div>
    );
  }

  if (!user) {
    // ここまで来て user がいない場合は素直にリダイレクト
    redirect("/login");
  }*/

  const movies: any[] | null = null;//24〜37要確認
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("watched_at", { ascending: false });

    if (error) {
      console.error("movies 取得エラー:", error);
    }
    movies = data;
  } catch (e) {
    console.error("movies クエリ実行エラー:", e);
  }

  return (
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
  );
}
