
import { movieAction } from '@/actions/movies';


export default async function MoviesPage() {
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
