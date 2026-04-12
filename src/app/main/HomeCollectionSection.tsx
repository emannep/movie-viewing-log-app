"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Collection } from "@/app/actions/collections";

const HOME_STORAGE_KEY = "home_featured_collections";
const TMDB_IMG = "https://image.tmdb.org/t/p/w154";

function CollectionPreview({
  collection,
  label,
}: {
  collection: Collection | null;
  label?: string;
}) {
  const progress =
    collection && collection.movies.length > 0
      ? Math.round((collection.collectedCount / collection.movies.length) * 100)
      : 0;

  return (
    <Link href="/main/collection">
      <div className="bg-zinc-900/70 border border-amber-800/40 rounded-2xl p-2.5 shadow-inner shadow-black/30 active:opacity-80 transition-opacity">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/50" />
          <span className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">
            {label ?? "コレクション"}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/50" />
        </div>

        {collection ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-amber-300 font-semibold text-xs">
                  {collection.decade}年代 {collection.genre}
                </p>
                <p className="text-zinc-500 text-[10px] mt-0.5">
                  {collection.collectedCount} / {collection.movies.length} 作品収集
                </p>
              </div>
              <span className="text-amber-400 text-base font-bold">{progress}%</span>
            </div>

            <div className="w-full h-1 bg-zinc-800 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-center gap-x-2 w-full">
              {collection.movies.slice(0, 5).map((movie) => (
                <div
                  key={movie.tmdb_id}
                  className="relative shrink-0 w-[56px] h-[72px] rounded overflow-hidden border border-amber-900/30 bg-zinc-800"
                >
                  {movie.collected && movie.poster_path ? (
                    <img
                      src={`${TMDB_IMG}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {movie.collected ? (
                        <span className="text-amber-400 text-[9px] text-center px-0.5 leading-tight">
                          {movie.title}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-base">?</span>
                      )}
                    </div>
                  )}
                  {movie.collected && (
                    <div className="absolute inset-0 ring-1 ring-amber-400/50 rounded pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-3 gap-1.5 text-center">
            <span className="text-2xl opacity-30">🏛️</span>
            <p className="text-zinc-400 text-xs">
              同じジャンルの映画を3本登録すると展示室が解放されます
            </p>
            <p className="text-amber-800/70 text-[10px] tracking-wide mt-0.5">展示室へ →</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HomeCollectionSection({
  collections,
}: {
  collections: Collection[];
}) {
  const [homeKeys, setHomeKeys] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const validKeys = new Set(
      collections.map((c) => `${c.genre}-${c.decade}`)
    );
    const stored = localStorage.getItem(HOME_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: string[] = JSON.parse(stored);
        setHomeKeys(new Set(parsed.filter((key) => validKeys.has(key)).slice(0, 2)));
      } catch {}
    }
    setMounted(true);
  }, [collections]);

  let featured: (Collection | null)[];

  if (!mounted || homeKeys.size === 0) {
    // fallback: 進捗率上位2件
    const sorted = [...collections].sort(
      (a, b) =>
        b.collectedCount / Math.max(b.movies.length, 1) -
        a.collectedCount / Math.max(a.movies.length, 1)
    );
    featured = sorted.slice(0, 2);
  } else {
    featured = collections.filter((c) => homeKeys.has(`${c.genre}-${c.decade}`));
  }

  if (featured.length === 0) {
    featured = [null];
  }

  return (
    <main className="flex flex-col gap-2">
      {featured.map((col, i) => (
        <CollectionPreview
          key={col ? `${col.decade}-${col.genre}` : "empty"}
          collection={col}
          label={featured.length > 1 ? `展示室 ${i + 1}` : "コレクション"}
        />
      ))}
    </main>
  );
}
