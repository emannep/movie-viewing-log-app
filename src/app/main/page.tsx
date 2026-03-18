import React from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
type Movie = {
  id: string
  title: string
  poster_url: string
}

export function MainPage( 
  { title, movies, }: {
    title: string
    movies: Movie[]
  }) {
  return (
    <div className="w-full rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
      <div className="px-8 pt-4 pb-6">

        <header className="mb-4 text-orange-300">
          <h1 className="flex justify-center"
          >
            みたろぐ</h1>
          <link rel="canonical" href="/main" />
        </header>

        <main className="flex flex-col items-center justify-center w-full">href="/main/recommend_movies"
          
          <div className="grid grid-cols-2 text-center p-8 gap-4">
            <Link className="p-4 bg-red-900 rounded-2xl"
              href="/main/registration">
                映画登録
            </Link>
            <Link className="p-4 bg-red-900 rounded-2xl"
              href="/main/movies">
                映画一覧・編集
            </Link>
            <Link className="p-4 bg-red-900 rounded-2xl"
              href="/main/settings">
                プロフィール・設定
            </Link>
            <Link className="p-4 bg-red-900 rounded-2xl"
              href="/main/movies/test">
                kari
            </Link>
          </div>
        </main>

        <footer>
          <p>Copyright © 2026 My Website</p>
        </footer>

      </div>
    </div>
  );
}

export default MainPage;

/*<Carousel className="flex justify-center w-full max-w-[80%] p-4 bg-red-900 rounded-2xl">
            <CarouselContent>
              {Array.from({ length: 5 })movies.map((movie) => (
                <CarouselItem key={movie.id} className="pl-1 basis-1/2 lg:basis-1/3">
                  <MovieCard movie={movie}>レコメンド、おすすめ</MovieCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>*/