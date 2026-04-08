'use client';

import React from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { RecommendedMovie } from "@/app/actions/recommend";

type WatchlistMovie = {
  id: string;
  movies: { title: string; poster_path: string | null; tmdb_id?: number | null } | null;
};

function MovieThumb({
  poster_path,
  title,
  tmdb_id,
}: {
  poster_path: string | null;
  title: string;
  tmdb_id?: number | null;
}) {
  const inner = (
    <div className="flex flex-col items-center gap-1">
      {poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w154${poster_path}`}
          alt={title}
          className="w-full rounded object-cover aspect-[2/3] bg-zinc-800"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500">
          No Image
        </div>
      )}
      <p className="text-[11px] text-zinc-200 text-center truncate w-full px-1">{title}</p>
    </div>
  );

  if (tmdb_id) {
    return (
      <a
        href={`https://www.themoviedb.org/movie/${tmdb_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block active:opacity-70 transition-opacity"
      >
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
}

export default function MainCarousel({
  recommendations,
  watchlist,
}: {
  recommendations: RecommendedMovie[];
  watchlist: WatchlistMovie[];
}) {
  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* おすすめ映画 */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/50" />
          <div className="flex items-center gap-2">
            <h2 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">おすすめ映画</h2>
            <Link href="/main/recommend_movies" className="text-[10px] text-amber-800/70 hover:text-amber-600 tracking-widest uppercase transition-colors">
              全て →
            </Link>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/50" />
        </div>
        {recommendations.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-2">
            視聴済み映画を★4以上で登録するとおすすめが表示されます
          </p>
        ) : (
          <Carousel
            plugins={[Autoplay({ delay: 3000 })]}
            opts={{ align: "start", loop: true }}
            className="w-full px-10"
          >
            <CarouselContent>
              {recommendations.map((movie) => (
                <CarouselItem key={movie.tmdb_id} className="basis-1/3">
                  <MovieThumb
                    poster_path={movie.poster_path}
                    title={movie.title}
                    tmdb_id={movie.tmdb_id}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        )}
      </section>

      {/* 観たいリスト */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/50" />
          <h2 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">観たいリスト</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/50" />
        </div>
        {watchlist.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-2">
            「視たい」ステータスで映画を登録しよう！
          </p>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} className="w-full px-10">
            <CarouselContent>
              {watchlist.map((row) => (
                <CarouselItem key={row.id} className="basis-1/3">
                  <MovieThumb
                    poster_path={row.movies?.poster_path ?? null}
                    title={row.movies?.title ?? ""}
                    tmdb_id={row.movies?.tmdb_id}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        )}
      </section>
    </div>
  );
}
