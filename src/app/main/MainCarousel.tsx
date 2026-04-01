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
  movies: { title: string; poster_path: string | null } | null;
};

function MovieThumb({ poster_path, title }: { poster_path: string | null; title: string }) {
  return (
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
}

export default function MainCarousel({
  recommendations,
  watchlist,
}: {
  recommendations: RecommendedMovie[];
  watchlist: WatchlistMovie[];
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* おすすめ映画 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-orange-300">おすすめ映画</h2>
          <Link href="/main/recommend_movies" className="text-xs text-orange-400 hover:underline">
            もっと見る →
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">
            視聴済み映画を★4以上で登録するとおすすめが表示されます
          </p>
        ) : (
          <Carousel
            plugins={[Autoplay({ delay: 3000 })]}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {recommendations.map((movie) => (
                <CarouselItem key={movie.tmdb_id} className="basis-1/3">
                  <MovieThumb poster_path={movie.poster_path} title={movie.title} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </section>

      {/* 観たいリスト */}
      <section>
        <h2 className="text-sm font-semibold text-orange-300 mb-2">観たいリスト</h2>
        {watchlist.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">
            「視たい」ステータスで映画を登録しよう！
          </p>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {watchlist.map((row) => (
                <CarouselItem key={row.id} className="basis-1/3">
                  <MovieThumb
                    poster_path={row.movies?.poster_path ?? null}
                    title={row.movies?.title ?? ""}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </section>
    </div>
  );
}
