"use client";

import * as React from "react";
import Link from "next/link";
import { deleteMovie } from "@/app/actions/registration";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

type UserMovieRow = {
  id: string;
  status?: string | null;
  memo?: string | null;
  watched_at?: string | null;
  created_at?: string | null;
  movies?: {
    id: string;
    title: string;
    year: number;
    genres: string[] | null;
    tmdb_id: number | null;
    imdb_id: string | null;
    poster_path: string | null;
    tmdb_vote_average: number | null;
  } | null;
  user_reviews?: {
    rating: number;
  } | null;
};

type SortKey = "created_at" | "watched_at" | "rating" | "title" | "year";
type SortDir = "asc" | "desc";

const SORT_KEY_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "created_at", label: "登録日" },
  { key: "watched_at", label: "視聴日" },
  { key: "rating",     label: "評価" },
  { key: "title",      label: "タイトル" },
  { key: "year",       label: "公開年" },
];

const STATUS_LABELS: Record<string, string> = {
  watched: "視聴済",
  wishlist: "視たい",
};

const TMDB_IMG = "https://image.tmdb.org/t/p/w185";

function jpDate(dateStr?: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function RatingStars({ rating }: { rating: number | null | undefined }) {
  if (rating == null) return <span className="text-zinc-600 text-xs">未評価</span>;
  return (
    <span className="text-xs tracking-tight leading-none">
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? (
          <span key={i} className="text-amber-400">★</span>
        ) : (
          <span key={i} className="text-zinc-700">★</span>
        )
      )}
    </span>
  );
}

function SortKeyDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const label = SORT_KEY_OPTIONS.find((o) => o.key === value)?.label ?? value;

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-zinc-900 border border-amber-900/40 text-amber-300/80 text-xs rounded-lg px-3 py-1.5 transition-colors hover:border-amber-700 min-w-[72px]"
      >
        <span>{label}</span>
        <span className="text-amber-800 ml-auto">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-zinc-900 border border-amber-900/40 rounded-lg overflow-hidden shadow-lg shadow-black/50 min-w-[90px]">
          {SORT_KEY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                opt.key === value ? "text-amber-400 bg-amber-950/40" : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortDirToggle({ value, onChange }: { value: SortDir; onChange: (v: SortDir) => void }) {
  return (
    <button
      onClick={() => onChange(value === "asc" ? "desc" : "asc")}
      className="flex items-center justify-center bg-zinc-900 border border-amber-900/40 text-amber-300/80 text-sm rounded-lg w-8 h-[30px] transition-colors hover:border-amber-700"
    >
      {value === "asc" ? "↑" : "↓"}
    </button>
  );
}

const RATING_OPTIONS = [
  { value: 0, label: "未評価" },
  { value: 1, label: "★1" },
  { value: 2, label: "★2" },
  { value: 3, label: "★3" },
  { value: 4, label: "★4" },
  { value: 5, label: "★5" },
];

function FilterPanel({
  movies,
  filterStatus,
  filterGenre,
  filterRatings,
  onStatusChange,
  onGenreChange,
  onRatingsChange,
}: {
  movies: UserMovieRow[];
  filterStatus: string;
  filterGenre: string;
  filterRatings: number[];
  onStatusChange: (v: string) => void;
  onGenreChange: (v: string) => void;
  onRatingsChange: (v: number[]) => void;
}) {
  const genres = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of movies) {
      for (const g of m.movies?.genres ?? []) set.add(g);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [movies]);

  const chipClass = (active: boolean) =>
    `text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
      active
        ? "bg-amber-800/60 border-amber-600/60 text-amber-200"
        : "bg-zinc-900 border-zinc-700/50 text-zinc-400 hover:border-zinc-500"
    }`;

  return (
    <div className="bg-zinc-950/80 border border-amber-900/20 rounded-xl p-3 flex flex-col gap-3">
      {/* ステータス */}
      <div>
        <p className="text-amber-700/70 text-[10px] tracking-widest uppercase mb-1.5">ステータス</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "all", label: "全て" },
            { value: "watched", label: "視聴済" },
            { value: "wishlist", label: "視たい" },
          ].map((s) => (
            <button key={s.value} onClick={() => onStatusChange(s.value)} className={chipClass(filterStatus === s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 評価（OR複数選択） */}
      <div>
        <p className="text-amber-700/70 text-[10px] tracking-widest uppercase mb-1.5">
          評価
          {filterRatings.length > 0 && (
            <button
              onClick={() => onRatingsChange([])}
              className="ml-2 normal-case text-amber-800/70 hover:text-amber-600 transition-colors"
            >
              クリア
            </button>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RATING_OPTIONS.map((r) => {
            const active = filterRatings.includes(r.value);
            return (
              <button
                key={r.value}
                onClick={() => {
                  if (active) {
                    onRatingsChange(filterRatings.filter((v) => v !== r.value));
                  } else {
                    onRatingsChange([...filterRatings, r.value]);
                  }
                }}
                className={chipClass(active)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ジャンル */}
      {genres.length > 0 && (
        <div>
          <p className="text-amber-700/70 text-[10px] tracking-widest uppercase mb-1.5">ジャンル</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => onGenreChange("all")} className={chipClass(filterGenre === "all")}>
              全て
            </button>
            {genres.map((g) => (
              <button key={g} onClick={() => onGenreChange(g)} className={chipClass(filterGenre === g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteConfirmDialog({
  title,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-amber-900/40 rounded-2xl p-6 shadow-2xl shadow-black/60 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-amber-300 font-semibold text-base">削除の確認</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            「<span className="text-zinc-200 font-medium">{title}</span>」を削除しますか？
          </p>
          <p className="text-zinc-600 text-xs">この操作は取り消せません。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isPending ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MoviesTable({ movies }: { movies: UserMovieRow[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = React.useState<SortKey>("created_at");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<UserMovieRow | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showFilter, setShowFilter] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterGenre, setFilterGenre] = React.useState("all");
  const [filterRatings, setFilterRatings] = React.useState<number[]>([]);

  const activeFilterCount = [
    filterStatus !== "all",
    filterGenre !== "all",
    filterRatings.length > 0,
  ].filter(Boolean).length;

  const filtered = React.useMemo(() => {
    return (movies ?? []).filter((item) => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterGenre !== "all" && !item.movies?.genres?.includes(filterGenre)) return false;
      if (filterRatings.length > 0) {
        const rating = item.user_reviews?.rating ?? 0;
        if (!filterRatings.includes(rating)) return false;
      }
      return true;
    });
  }, [movies, filterStatus, filterGenre, filterRatings]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    const key = sortKey;
    const dir = sortDir;
    copy.sort((a, b) => {
      let av: string | number | null = null;
      let bv: string | number | null = null;
      if (key === "title") {
        const cmp = (a.movies?.title ?? "").localeCompare(b.movies?.title ?? "", "ja");
        return dir === "asc" ? cmp : -cmp;
      }
      if (key === "year")       { av = a.movies?.year ?? 0; bv = b.movies?.year ?? 0; }
      if (key === "rating")     { av = a.user_reviews?.rating ?? -1; bv = b.user_reviews?.rating ?? -1; }
      if (key === "created_at") { av = new Date(a.created_at ?? 0).getTime(); bv = new Date(b.created_at ?? 0).getTime(); }
      if (key === "watched_at") { av = new Date(a.watched_at ?? 0).getTime(); bv = new Date(b.watched_at ?? 0).getTime(); }
      const diff = (av as number) - (bv as number);
      return dir === "asc" ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMovie(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedId(null);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!movies?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-5xl opacity-30">🎬</div>
        <p className="text-zinc-400 text-sm">まだ登録された映画がありません</p>
      </div>
    );
  }

  const selectedItem = sorted.find((i) => i.id === selectedId);

  return (
    <>
      {deleteTarget && (
        <DeleteConfirmDialog
          title={deleteTarget.movies?.title ?? ""}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}

      <div className="flex flex-col gap-3">
        {/* ツールバー */}
        <div className="flex items-center gap-2">
          <SortKeyDropdown value={sortKey} onChange={setSortKey} />
          <SortDirToggle value={sortDir} onChange={setSortDir} />

          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-1.5 border text-xs rounded-lg px-2.5 py-1.5 transition-colors ${
              showFilter || activeFilterCount > 0
                ? "bg-amber-900/40 border-amber-700/60 text-amber-300"
                : "bg-zinc-900 border-amber-900/40 text-amber-300/80 hover:border-amber-700"
            }`}
          >
            <SlidersHorizontal size={13} />
            {activeFilterCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex gap-2 ml-auto">
            {selectedId ? (
              <Link href={`/main/registration?editId=${selectedId}`}>
                <button className="bg-amber-800 hover:bg-amber-700 text-amber-100 text-xs font-semibold rounded-lg px-4 py-1.5 transition-colors">
                  編集
                </button>
              </Link>
            ) : (
              <button disabled className="bg-zinc-800 text-zinc-600 text-xs font-semibold rounded-lg px-4 py-1.5 cursor-not-allowed">
                編集
              </button>
            )}

            {selectedId && selectedItem ? (
              <button
                onClick={() => setDeleteTarget(selectedItem)}
                className="bg-red-950 hover:bg-red-900 border border-red-900/60 text-red-400 text-xs font-semibold rounded-lg px-4 py-1.5 transition-colors"
              >
                削除
              </button>
            ) : (
              <button disabled className="bg-zinc-800 text-zinc-600 text-xs font-semibold rounded-lg px-4 py-1.5 cursor-not-allowed">
                削除
              </button>
            )}
          </div>
        </div>

        {/* 絞り込みパネル */}
        {showFilter && (
          <FilterPanel
            movies={movies}
            filterStatus={filterStatus}
            filterGenre={filterGenre}
            filterRatings={filterRatings}
            onStatusChange={setFilterStatus}
            onGenreChange={setFilterGenre}
            onRatingsChange={setFilterRatings}
          />
        )}

        {/* 件数表示 */}
        {activeFilterCount > 0 && (
          <p className="text-zinc-500 text-xs">
            {sorted.length} / {movies.length} 件
            <button
              onClick={() => { setFilterStatus("all"); setFilterGenre("all"); setFilterRatings([]); }}
              className="ml-2 text-amber-800/70 hover:text-amber-600 transition-colors"
            >
              絞り込みをクリア
            </button>
          </p>
        )}

        {/* カードグリッド */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <p className="text-zinc-500 text-sm">条件に一致する映画がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {sorted.map((item) => {
              const movie = item.movies;
              const selected = selectedId === item.id;
              const genre = movie?.genres?.[0] ?? null;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={`flex flex-col rounded-xl overflow-hidden border transition-all text-left ${
                    selected
                      ? "border-amber-500 shadow-lg shadow-amber-900/30 scale-[1.02]"
                      : "border-amber-900/20 hover:border-amber-800/40"
                  }`}
                >
                  <div className="relative aspect-[2/3] w-full bg-zinc-900">
                    {movie?.poster_path ? (
                      <img
                        src={`${TMDB_IMG}${movie.poster_path}`}
                        alt={movie?.title ?? ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">
                        No Image
                      </div>
                    )}
                    {item.status && (
                      <span className={`absolute top-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded ${
                        item.status === "watched"
                          ? "bg-amber-900/90 text-amber-300"
                          : "bg-zinc-800/90 text-zinc-300"
                      }`}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    )}
                    {selected && (
                      <div className="absolute inset-0 ring-2 ring-amber-500 rounded-xl pointer-events-none" />
                    )}
                  </div>

                  <div className="bg-zinc-950/90 px-2 py-1.5 flex flex-col gap-0.5 flex-1">
                    <p className="text-zinc-200 text-[11px] font-medium leading-tight line-clamp-2">
                      {movie?.title ?? ""}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-zinc-600 text-[10px] shrink-0">{movie?.year ?? ""}</p>
                      {genre && <p className="text-zinc-600 text-[10px] truncate text-right">{genre}</p>}
                    </div>
                    <RatingStars rating={item.user_reviews?.rating} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 選択中の詳細（画面下部固定） */}
        {selectedId && selectedItem && (
          <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4">
            <div className="w-full max-w-lg bg-zinc-900/95 border border-amber-900/40 rounded-xl p-4 flex flex-col gap-2 shadow-2xl shadow-black/60 backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <h3 className="[flex:21] min-w-0 break-words text-amber-300 font-semibold text-sm leading-tight">{selectedItem.movies?.title}</h3>
                <div className="[flex:6] text-center min-w-0 break-words text-zinc-300 text-xs leading-tight pt-0.5">{STATUS_LABELS[selectedItem.status ?? ""] ?? selectedItem.status}</div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="[flex:1] min-w-0 text-zinc-600 hover:text-zinc-400 text-base leading-none text-center pt-0.5"
                  aria-label="閉じる"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                {selectedItem.movies?.year && <span>{selectedItem.movies.year}年</span>}
                {selectedItem.movies?.genres?.length ? (
                  <span>{selectedItem.movies.genres.join(", ")}</span>
                ) : null}
                <RatingStars rating={selectedItem.user_reviews?.rating} />
                {selectedItem.watched_at && <span>視聴日: {jpDate(selectedItem.watched_at)}</span>}
              </div>
              {selectedItem.memo && (
                <p className="text-zinc-400 text-xs leading-relaxed border-t border-zinc-800 pt-2 mt-1 line-clamp-3">
                  {selectedItem.memo}
                </p>
              )}
              {selectedItem.movies?.tmdb_id && (
                <a
                  href={`https://www.themoviedb.org/movie/${selectedItem.movies.tmdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 text-xs underline self-start"
                  onClick={(e) => e.stopPropagation()}
                >
                  TMDBで見る
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
