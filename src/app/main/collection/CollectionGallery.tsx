"use client";

import { useState, useEffect } from "react";
import { Check, Home, SlidersHorizontal, Trophy, X } from "lucide-react";

const HOME_STORAGE_KEY = "home_featured_collections";
const SELECTED_KEYS_STORAGE_KEY = "collection_selected_keys";
const SHOW_COMPLETED_KEY = "collection_show_completed";
import type { Collection } from "@/app/actions/collections";

const TMDB_IMG = "https://image.tmdb.org/t/p/w185";

const RANK_STYLES: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-400",  text: "text-zinc-900" },
  2: { bg: "bg-slate-300",   text: "text-zinc-900" },
  3: { bg: "bg-amber-600",   text: "text-zinc-100" },
};

type SelectedCollectionMovie = Collection["movies"][number] & { genre: string; decade: number };

function isCollectionComplete(c: Collection): boolean {
  return c.movies.length > 0 && c.collectedCount === c.movies.length;
}

function PosterSlot({
  movie,
  onSelect,
}: {
  movie: Collection["movies"][number];
  onSelect: () => void;
}) {
  const rankStyle = RANK_STYLES[movie.rank] ?? { bg: "bg-zinc-700", text: "text-zinc-200" };

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 max-w-[80px]">
      <button
        className="relative w-full aspect-[2/3] rounded overflow-hidden border border-amber-900/40 shrink-0 cursor-pointer active:opacity-80"
        onClick={onSelect}
        aria-label={`${movie.title}の詳細を見る`}
      >
        {movie.poster_path ? (
          <img
            src={`${TMDB_IMG}${movie.poster_path}`}
            alt={movie.title}
            className={`w-full h-full object-cover ${!movie.collected ? "opacity-30 grayscale" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex flex-col items-center justify-center gap-1">
            <span className={`text-xs text-center px-1 leading-tight ${movie.collected ? "text-amber-400" : "text-zinc-600"}`}>
              {movie.title}
            </span>
          </div>
        )}
        {/* ランクバッジ */}
        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${rankStyle.bg} ${rankStyle.text}`}>
          {movie.rank}
        </div>
        {movie.collected && (
          <div className="absolute inset-0 ring-1 ring-amber-400/60 rounded pointer-events-none" />
        )}
        {!movie.collected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-zinc-500 text-2xl">?</span>
          </div>
        )}
      </button>
      <span className={`text-[11px] w-full text-center leading-tight break-words ${movie.collected ? "text-zinc-300" : "text-zinc-500"}`}>
        {movie.title}
      </span>
    </div>
  );
}

function CollectionCase({
  collection,
  collectionIndex,
  isHome,
  canAddHome,
  onToggleHome,
  onSelectMovie,
}: {
  collection: Collection;
  collectionIndex: number;
  isHome: boolean;
  canAddHome: boolean;
  onToggleHome: () => void;
  onSelectMovie: (movie: SelectedCollectionMovie) => void;
}) {
  const progress = collection.movies.length > 0
    ? Math.round((collection.collectedCount / collection.movies.length) * 100)
    : 0;
  const complete = progress === 100;

  return (
    <section className="mb-10">
      {/* セクションヘッダー */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-900/40" />
        <h2 className={`text-xs tracking-widest uppercase px-2 shrink-0 flex items-center gap-1.5 ${complete ? "text-amber-400" : "text-amber-700"}`}>
          {complete && <Trophy size={10} />}
          コレクション {collectionIndex}
        </h2>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-amber-900/40" />
        <button
          onClick={onToggleHome}
          disabled={!isHome && !canAddHome}
          className={`absolute right-0 flex items-center gap-1 text-[10px] transition-colors ${
            isHome
              ? "text-amber-400"
              : canAddHome
              ? "text-zinc-500 hover:text-amber-600"
              : "text-zinc-700 cursor-not-allowed"
          }`}
        >
          <Home size={10} />
          {isHome ? "表示中" : "ホームに表示"}
        </button>
      </div>

      {/* コレクションカード */}
      <div className={`bg-zinc-900/80 rounded-xl p-4 shadow-inner shadow-black/40 transition-all ${
        complete
          ? "border border-amber-400/50 shadow-lg shadow-amber-400/10"
          : "border border-amber-900/30"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-amber-300 font-semibold text-sm">
              {collection.decade}年代 {collection.genre}
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              {collection.collectedCount} / {collection.movies.length} 作品収集
            </p>
          </div>
          <div className="text-right">
            {complete ? (
              <span className="text-amber-400 text-xs font-bold tracking-wider">COMPLETE</span>
            ) : (
              <span className="text-amber-400 text-lg font-bold">{progress}%</span>
            )}
          </div>
        </div>

        <div className="w-full h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${complete ? "bg-amber-400" : "bg-amber-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative flex flex-nowrap gap-2 justify-center">
          {collection.movies.map((movie) => (
            <PosterSlot
              key={movie.tmdb_id}
              movie={movie}
              onSelect={() => onSelectMovie({ ...movie, genre: collection.genre, decade: collection.decade })}
            />
          ))}
          {collection.movies.length === 0 && (
            <p className="text-zinc-600 text-xs py-4">データを読み込み中...</p>
          )}
          {/* COMPLETEスタンプ */}
          {complete && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-amber-400/20 font-black text-4xl tracking-widest rotate-[-12deg] border-2 border-amber-400/20 px-3 py-1 rounded select-none">
                COMPLETE
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CollectionGallery({
  collections,
}: {
  collections: Collection[];
}) {
  const activeCollections = collections.filter((c) => !isCollectionComplete(c));
  const completedCollections = collections.filter(isCollectionComplete);
  const activeKeys = activeCollections.map((c) => `${c.genre}-${c.decade}`);
  const completedKeys = completedCollections.map((c) => `${c.genre}-${c.decade}`);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([...activeKeys.slice(0, 5), ...completedKeys])
  );
  const [homeKeys, setHomeKeys] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCompletedSheet, setShowCompletedSheet] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<SelectedCollectionMovie | null>(null);

  useEffect(() => {
    const storedSelected = localStorage.getItem(SELECTED_KEYS_STORAGE_KEY);
    if (storedSelected) {
      try {
        const parsed: string[] = JSON.parse(storedSelected);
        const allKeys = [...activeKeys, ...completedKeys];
        const valid = parsed.filter((k) => allKeys.includes(k));
        if (valid.length > 0) setSelectedKeys(new Set(valid));
      } catch {}
    }
    const storedHome = localStorage.getItem(HOME_STORAGE_KEY);
    if (storedHome) {
      try {
        const parsed: string[] = JSON.parse(storedHome);
        const allKeys = collections.map((c) => `${c.genre}-${c.decade}`);
        const valid = parsed.filter((k) => allKeys.includes(k)).slice(0, 2);
        setHomeKeys(new Set(valid));
      } catch {}
    }
    const storedShowCompleted = localStorage.getItem(SHOW_COMPLETED_KEY);
    if (storedShowCompleted) {
      setShowCompleted(storedShowCompleted === "true");
    }
  }, [collections]);

  function toggleKey(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < 5) {
        next.add(key);
      }
      localStorage.setItem(SELECTED_KEYS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function toggleShowCompleted() {
    setShowCompleted((prev) => {
      const next = !prev;
      localStorage.setItem(SHOW_COMPLETED_KEY, String(next));
      return next;
    });
  }

  function toggleCollectionHome(key: string) {
    setHomeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < 2) {
        next.add(key);
      }
      localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  if (collections.length === 0) {
    return (
      <>
        <header className="flex flex-col items-center gap-1 pt-1">
          <div className="flex items-center gap-3 w-full">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-900/50" />
            <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">展示室</h1>
            <div className="h-px flex-1 bg-linear-to-l from-transparent to-amber-900/50" />
          </div>
          <p className="text-zinc-600 text-xs">映画を登録してコレクションを解放しよう</p>
        </header>
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="text-5xl opacity-30">🏛️</div>
          <p className="text-zinc-400 text-sm">まだコレクションが解放されていません</p>
          <p className="text-zinc-600 text-xs">
            同じジャンルの映画を3本登録すると、最初の展示室が解放されます
          </p>
        </div>
      </>
    );
  }

  const displayedActive = activeCollections.filter((c) =>
    selectedKeys.has(`${c.genre}-${c.decade}`)
  );
  const displayedCompleted = completedCollections.filter((c) =>
    selectedKeys.has(`${c.genre}-${c.decade}`)
  );
  const displayed = [...displayedActive, ...displayedCompleted];

  return (
    <>
      {/* ヘッダー */}
      <header className="flex flex-col items-center gap-1 pt-1">
        <div className="relative flex items-center gap-3 w-full">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-900/50" />
          <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase shrink-0">展示室</h1>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-amber-900/50" />
          {completedCollections.length > 0 && (
            <button
              onClick={() => setShowCompletedSheet(true)}
              className="absolute left-0 flex items-center gap-1 text-[10px] rounded-lg border border-amber-900/40 bg-zinc-900/95 px-2 py-1.5 text-amber-600 hover:text-amber-400 transition-colors"
            >
              <Trophy size={12} />
              {completedCollections.length}件
            </button>
          )}
          <button
            onClick={() => setShowPicker(true)}
            className="absolute right-0 flex items-center gap-1 text-[10px] rounded-lg border border-amber-900/40 bg-zinc-900/95 px-2 py-1.5 text-amber-700 hover:text-amber-500 transition-colors"
          >
            <SlidersHorizontal size={12} />
            選択
          </button>
        </div>
        <p className="text-zinc-600 text-xs">
          {selectedKeys.size} / {collections.length} 件表示中
          {completedCollections.length > 0 && (
            <span className="ml-1.5 text-amber-700/60">
              ／ コンプリート {completedCollections.length}件
            </span>
          )}
        </p>
      </header>

      {/* ギャラリー */}
      <div>
        {displayed.map((c, i) => {
          const key = `${c.genre}-${c.decade}`;
          const isHome = homeKeys.has(key);
          const canAddHome = !isHome && homeKeys.size < 2;
          return (
            <CollectionCase
              key={key}
              collection={c}
              collectionIndex={i + 1}
              isHome={isHome}
              canAddHome={canAddHome}
              onToggleHome={() => toggleCollectionHome(key)}
              onSelectMovie={setSelectedMovie}
            />
          );
        })}
      </div>

      {/* 映画詳細ポップアップ */}
      {selectedMovie && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4">
          <div className="w-full max-w-lg bg-zinc-900/95 border border-amber-900/40 rounded-xl p-4 flex flex-col gap-2 shadow-2xl shadow-black/60 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-amber-300 font-semibold text-sm leading-tight">{selectedMovie.title}</h3>
                {selectedMovie.year && <p className="text-zinc-500 text-xs">{selectedMovie.year}年公開</p>}
              </div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="text-zinc-600 hover:text-zinc-400 text-base leading-none shrink-0"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>
            <a
              href={`https://www.themoviedb.org/movie/${selectedMovie.tmdb_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 text-xs underline self-start"
            >
              TMDBで見る
            </a>
          </div>
        </div>
      )}

      {/* コンプリート済みコレクション ボトムシート */}
      {showCompletedSheet && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCompletedSheet(false)}
          />
          <div className="relative bg-zinc-900 border-t border-amber-900/30 rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-amber-400" />
                <h3 className="text-amber-400 font-semibold text-sm">コンプリート済みコレクション</h3>
              </div>
              <button
                onClick={() => setShowCompletedSheet(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {completedCollections.map((c, i) => {
              const key = `${c.genre}-${c.decade}`;
              const isHome = homeKeys.has(key);
              const canAddHome = !isHome && homeKeys.size < 2;
              return (
                <CollectionCase
                  key={key}
                  collection={c}
                  collectionIndex={i + 1}
                  isHome={isHome}
                  canAddHome={canAddHome}
                  onToggleHome={() => toggleCollectionHome(key)}
                  onSelectMovie={setSelectedMovie}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* コレクション選択ボトムシート */}
      {showPicker && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPicker(false)}
          />
          <div className="relative bg-zinc-900 border-t border-amber-900/30 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-amber-400 font-semibold text-sm">表示するコレクションを選択</h3>
                <p className="text-zinc-500 text-xs mt-0.5">最大5件まで選択できます</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ">
                {completedCollections.length > 0 && (
                  <button
                    onClick={toggleShowCompleted}
                    className="flex items-center gap-2 active:opacity-70 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      showCompleted ? "bg-amber-500 border-amber-500" : "border-zinc-500"
                    }`}>
                      {showCompleted && <Check size={10} className="text-zinc-900" />}
                    </div>
                    <p className="text-xs text-amber-300/80 whitespace-nowrap">コンプリート済を表示</p>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {activeCollections.map((c) => {
                const key = `${c.genre}-${c.decade}`;
                const isSelected = selectedKeys.has(key);
                const isDisabled = !isSelected && selectedKeys.size >= 5;
                return (
                  <button
                    key={key}
                    onClick={() => !isDisabled && toggleKey(key)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                      isSelected
                        ? "border-amber-600/60 bg-amber-900/20"
                        : "border-zinc-700/60 bg-zinc-800/40"
                    } ${isDisabled ? "opacity-40 cursor-not-allowed" : "active:opacity-70"}`}
                  >
                    <div>
                      <p className="text-sm text-amber-300">{c.decade}年代 {c.genre}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{c.collectedCount} / {c.movies.length} 作品収集</p>
                    </div>
                    {isSelected && <Check size={16} className="text-amber-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
              {showCompleted && completedCollections.map((c) => {
                const key = `${c.genre}-${c.decade}`;
                const isSelected = selectedKeys.has(key);
                const isDisabled = !isSelected && selectedKeys.size >= 5;
                return (
                <button
                  key={`${c.genre}-${c.decade}`}
                  onClick={() => !isDisabled && toggleKey(key)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? "border-amber-600/60 bg-amber-900/20"
                      : "border-zinc-700/60 bg-zinc-800/40"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : "active:opacity-70"}`}
                >
                  <div>
                    <p className="text-sm text-amber-300 flex items-center gap-1.5">
                      {c.decade}年代 {c.genre}
                      <Trophy size={11} className="text-amber-500 shrink-0" />
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{c.collectedCount} / {c.movies.length} 作品収集</p>
                  </div>
                  <div>
                    {isSelected && <Check size={16} className="text-amber-400 shrink-0 ml-2" />}
                  </div>
                </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
