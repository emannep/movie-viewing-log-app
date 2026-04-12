
import { Suspense } from "react";
import { movieAction } from '@/app/actions/movies';
import { MoviesTable } from "./MoviesTable";
import CollectionUnlockedToast from "@/components/CollectionUnlockedToast";


export default async function MoviesPage() {
  const movies = await movieAction();

  return (
    <div className="w-full flex flex-col gap-4">
      <Suspense>
        <CollectionUnlockedToast />
      </Suspense>

      <header className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/50" />
        <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">収蔵作品一覧</h1>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/50" />
      </header>

      <MoviesTable movies={movies} />
    </div>
  );
}
