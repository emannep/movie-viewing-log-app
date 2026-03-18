
import { movieAction } from '@/app/actions/movies';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { SlActionUndo } from "react-icons/sl";
import { MoviesTable } from "./MoviesTable";


export default async function MoviesPage() {
  const movies = await movieAction();

  return (
    <div className="p-4 mx-auto max-w-3xl space-y-2">

      <div className="flex flex-raw justify-between w-full">
        <h2 className="text-xl font-semibold">登録映画一覧</h2>
        <div>
            <Link
              className="flex justify-center"
              href="/main"
            >
              <Button variant="outline" size="icon"
                className=" bg-red-900 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
              >
                <SlActionUndo />
              </Button>
            </Link>
        </div>
      </div>

      <MoviesTable movies={movies} />

    </div>
  );
}

/*
<div className="space-y-4 rounded-md border p-4">
{movies.length ? (
  movies.map((item: any) => (
    <div key={item.id} className="rounded border p-3 text-sm leading-relaxed">
      <div className="flex items-center justify-between">
        {item.movies?.title && `${item.movies.title}`}
      </div>
      <div className="text-red-900">
        {item.movies?.year && `${item.movies.year}年`}
      </div>
      <div className="text-red-900">
        {item.movies?.genres && `${item.movies.genres}`}
      </div>

      <div className="text-red-900">
        {item.status && `${item.status}`}
      </div>

      <div className="text-yellow-500">
        {item.user_reviews?.[0]?.rating && `評価: ${item.user_reviews[0].rating}`}
      </div>
      <div className="text-xs text-gray-500">
        {item.memo && (
          <p className="mt-1 whitespace-pre-wrap">
            メモのリンクアイコン/横線
          </p>
        )}
      </div>

      <div className="text-yellow-500">
        {item.watched_at && `視聴日: ${item.watched_at}`}
      </div>
      <div className="text-yellow-500">
        {item.created_at && `データ作成日: ${item.created_at}`}
      </div>
    </div>
  ))
) : (<p className="text-sm text-gray-500">まだ登録された映画がありません！</p>)
}
</div>
*/