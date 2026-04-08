"use client";

import { useState, useEffect } from "react";
import { Check, Home, SlidersHorizontal, X } from "lucide-react";

const HOME_STORAGE_KEY = "home_featured_collections";
const SELECTED_KEYS_STORAGE_KEY = "collection_selected_keys";
import type { Collection } from "@/app/actions/collections";

const TMDB_IMG = "https://image.tmdb.org/t/p/w185";

const RANK_STYLES: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-400",  text: "text-zinc-900" },
  2: { bg: "bg-slate-300",   text: "text-zinc-900" },
  3: { bg: "bg-amber-600",   text: "text-zinc-100" },
};

function PosterSlot({ movie }: { movie: Collection["movies"][number] }) {
  const rankStyle = RANK_STYLES[movie.rank] ?? { bg: "bg-zinc-700", text: "text-zinc-200" };

  return (
    <div className="flex flex-col items-center gap-1.5 w-20">
      <div className="relative w-20 h-[120px] rounded overflow-hidden border border-amber-900/40 shrink-0">
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
      </div>
      <span className={`text-[11px] w-20 text-center leading-tight break-words ${movie.collected ? "text-zinc-300" : "text-zinc-500"}`}>
        {movie.title}
      </span>
    </div>
  );
}

function CollectionCase({ collection }: { collection: Collection }) {
  const progress = collection.movies.length > 0
    ? Math.round((collection.collectedCount / collection.movies.length) * 100)
    : 0;

  return (
    <div className="bg-zinc-900/80 border border-amber-900/30 rounded-xl p-4 shadow-inner shadow-black/40">
      {/* ケースヘッダー */}
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
          <span className="text-amber-400 text-lg font-bold">{progress}%</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ポスターグリッド */}
      <div className="flex flex-nowrap gap-3 justify-center">
        {collection.movies.map((movie) => (
          <PosterSlot key={movie.tmdb_id} movie={movie} />
        ))}
        {collection.movies.length === 0 && (
          <p className="text-zinc-600 text-xs py-4">データを読み込み中...</p>
        )}
      </div>
    </div>
  );
}

function Room({
  roomIndex,
  collections,
  homeKeys,
  onToggleRoomHome,
}: {
  roomIndex: number;
  collections: Collection[];
  homeKeys: Set<string>;
  onToggleRoomHome: (roomKeys: string[]) => void;
}) {
  const roomKeys = collections.map((c) => `${c.genre}-${c.decade}`);
  const isHome = roomKeys.some((k) => homeKeys.has(k));
  const canAdd = !isHome && homeKeys.size < 2;

  return (
    <section className="mb-10">
      <div className="relative flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-900/40" />
        <h2 className="text-amber-700 text-xs tracking-widest uppercase px-2 shrink-0">
          展示室 {roomIndex + 1}
        </h2>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-amber-900/40" />
        <button
          onClick={() => onToggleRoomHome(roomKeys)}
          disabled={!isHome && !canAdd}
          className={`absolute right-0 flex items-center gap-1 text-[10px] transition-colors ${
            isHome
              ? "text-amber-400"
              : canAdd
              ? "text-zinc-500 hover:text-amber-600"
              : "text-zinc-700 cursor-not-allowed"
          }`}
        >
          <Home size={10} />
          {isHome ? "表示中" : "ホームに表示"}
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:grid-cols-2">
        {collections.map((c) => (
          <CollectionCase key={`${c.genre}-${c.decade}`} collection={c} />
        ))}
      </div>
    </section>
  );
}

export default function CollectionGallery({
  collections,
}: {
  collections: Collection[];
}) {
  const collectionKeys = collections.map((c) => `${c.genre}-${c.decade}`);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set(collectionKeys.slice(0, 5))
  );
  const [homeKeys, setHomeKeys] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const storedSelected = localStorage.getItem(SELECTED_KEYS_STORAGE_KEY);
    if (storedSelected) {
      try {
        const parsed: string[] = JSON.parse(storedSelected);
        // 現在存在するコレクションのキーのみ残す
        const valid = parsed.filter((k) => collectionKeys.includes(k));
        if (valid.length > 0) setSelectedKeys(new Set(valid));
      } catch {}
    }
    const storedHome = localStorage.getItem(HOME_STORAGE_KEY);
    if (storedHome) {
      try {
        const parsed: string[] = JSON.parse(storedHome);
        const validKeys = collections.map((c) => `${c.genre}-${c.decade}`);
        const valid = parsed.filter((k) => validKeys.includes(k)).slice(0, 2);
        setHomeKeys(new Set(valid));
      } catch {}
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

  function toggleRoomHome(roomKeys: string[]) {
    setHomeKeys((prev) => {
      const next = new Set(prev);
      const isHome = roomKeys.some((k) => next.has(k));
      if (isHome) {
        roomKeys.forEach((k) => next.delete(k));
      } else {
        for (const k of roomKeys) {
          if (next.size < 2) next.add(k);
        }
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

  const displayed = collections.filter((c) =>
    selectedKeys.has(`${c.genre}-${c.decade}`)
  );

  // 部屋ごとにグループ化
  const rooms = new Map<number, Collection[]>();
  for (const c of displayed) {
    if (!rooms.has(c.roomIndex)) rooms.set(c.roomIndex, []);
    rooms.get(c.roomIndex)!.push(c);
  }

  return (
    <>
      {/* ヘッダー */}
      <header className="flex flex-col items-center gap-1 pt-1">
        <div className="relative flex items-center gap-3 w-full">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-900/50" />
          <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase shrink-0">展示室</h1>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-amber-900/50" />
          <button
            onClick={() => setShowPicker(true)}
            className="absolute right-0 flex items-center gap-1 text-[10px] text-amber-700 hover:text-amber-500 transition-colors"
          >
            <SlidersHorizontal size={12} />
            選択
          </button>
        </div>
        <p className="text-zinc-600 text-xs">
          {selectedKeys.size} / {collections.length} 件表示中
        </p>
      </header>

      {/* ギャラリー */}
      <div>
        {Array.from(rooms.entries()).map(([roomIndex, roomCollections]) => (
          <Room
            key={roomIndex}
            roomIndex={roomIndex}
            collections={roomCollections}
            homeKeys={homeKeys}
            onToggleRoomHome={toggleRoomHome}
          />
        ))}
      </div>

      {/* コレクション選択ボトムシート */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPicker(false)}
          />
          <div className="relative bg-zinc-900 border-t border-amber-900/30 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-amber-400 font-semibold text-sm">表示するコレクションを選択</h3>
                <p className="text-zinc-500 text-xs mt-0.5">最大5件まで選択できます</p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {collections.map((c) => {
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
                      <p className="text-sm text-amber-300">
                        {c.decade}年代 {c.genre}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {c.collectedCount} / {c.movies.length} 作品収集
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-amber-400 shrink-0 ml-2" />
                    )}
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
