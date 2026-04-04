"use client";

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
}: {
  roomIndex: number;
  collections: Collection[];
}) {
  return (
    <section className="mb-10">
      {/* 部屋の入口 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/40" />
        <h2 className="text-amber-700 text-xs tracking-widest uppercase px-2">
          展示室 {roomIndex + 1}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/40" />
      </div>

      {/* コレクションケース */}
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
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-5xl opacity-30">🏛️</div>
        <p className="text-zinc-400 text-sm">
          まだコレクションが解放されていません
        </p>
        <p className="text-zinc-600 text-xs">
          同じジャンルの映画を3本登録すると、最初の展示室が解放されます
        </p>
      </div>
    );
  }

  // 部屋ごとにグループ化
  const rooms = new Map<number, Collection[]>();
  for (const c of collections) {
    if (!rooms.has(c.roomIndex)) rooms.set(c.roomIndex, []);
    rooms.get(c.roomIndex)!.push(c);
  }

  return (
    <div>
      {Array.from(rooms.entries()).map(([roomIndex, roomCollections]) => (
        <Room
          key={roomIndex}
          roomIndex={roomIndex}
          collections={roomCollections}
        />
      ))}
    </div>
  );
}
