import Link from "next/link";
import { getRecommendations } from "@/app/actions/recommend";

export default async function RecommendMoviesPage() {
  const movies = await getRecommendations(12);

  return (
    <div className="w-full rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
      <div className="px-6 pt-4 pb-6">

        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-300">おすすめ映画</h1>
          <Link
            href="/main"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            ← 戻る
          </Link>
        </header>

        {movies.length === 0 ? (
          <p className="text-center text-zinc-400 py-12">
            視聴済み映画を★4以上で登録するとおすすめが表示されます
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.tmdb_id}
                className="flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700"
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover bg-zinc-800"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-sm text-zinc-500">
                    No Image
                  </div>
                )}
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-zinc-100 line-clamp-2">{movie.title}</p>
                  <p className="text-xs text-zinc-400">{movie.year}</p>
                  <p className="text-xs text-yellow-400">★ {movie.tmdb_vote_average.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
