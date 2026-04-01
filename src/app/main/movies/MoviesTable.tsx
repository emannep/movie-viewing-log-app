"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SlActionUndo } from "react-icons/sl";

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

type SortKey =
  | "title"
  | "year"
  | "genres"
  | "status"
  | "rating"
  | "tmdb_vote_average"
  | "memo"
  | "watched_at"
  | "created_at";

type SortDir = "asc" | "desc";

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : null;
}

function toTime(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const t = new Date(String(v)).getTime();
  return Number.isFinite(t) ? t : null;
}

function toText(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function compareNullable(a: unknown, b: unknown, kind: "text" | "number" | "time") {
  if (kind === "number") {
    const an = toNumber(a);
    const bn = toNumber(b);
    if (an === null && bn === null) return 0;
    if (an === null) return 1;
    if (bn === null) return -1;
    return an - bn;
  }

  if (kind === "time") {
    const at = toTime(a);
    const bt = toTime(b);
    if (at === null && bt === null) return 0;
    if (at === null) return 1;
    if (bt === null) return -1;
    return at - bt;
  }

  const as = toText(a);
  const bs = toText(b);
  if (!as && !bs) return 0;
  if (!as) return 1;
  if (!bs) return -1;
  return as.localeCompare(bs, "ja");
}

function getValue(row: UserMovieRow, key: SortKey): unknown {
  const movie = row.movies;
  switch (key) {
    case "title":
      return movie?.title ?? "";
    case "year":
      return movie?.year ?? null;
    case "genres":
      return movie?.genres ? movie.genres.join(", ") : "";
    case "status":
      return row.status ?? "";
    case "rating":
      return row.user_reviews?.rating ?? null;
    case "tmdb_vote_average":
      return movie?.tmdb_vote_average ?? null;
    case "memo":
      return row.memo ?? "";
    case "watched_at":
      return row.watched_at ?? null;
    case "created_at":
      return row.created_at ?? null;
  }
}

function kindOf(key: SortKey): "text" | "number" | "time" {
  if (key === "year" || key === "rating") return "number";
  if (key === "watched_at" || key === "created_at") return "time";
  return "text";
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-block w-3 text-xs text-zinc-500" aria-hidden="true">
      {active ? (dir === "asc" ? "▲" : "▼") : ""}
    </span>
  );
}

function Th({
  k,
  active,
  dir,
  onToggle,
  children,
  className,
}: {
  k: SortKey;
  active: boolean;
  dir: SortDir;
  onToggle: (key: SortKey) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onToggle(k)}
        className="flex w-full items-center whitespace-nowrap font-semibold text-zinc-200 hover:text-white"
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        {children}
        <SortIcon active={active} dir={dir} />
      </button>
    </th>
  );
}

export function MoviesTable({ movies }: { movies: UserMovieRow[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("created_at");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [selectedMovieId, setSelectedMovieId] = React.useState<string | null>(null);

  const sorted = React.useMemo(() => {
    const copy = [...(movies || [])];
    const kind = kindOf(sortKey);
    copy.sort((a, b) => {
      const base = compareNullable(getValue(a, sortKey), getValue(b, sortKey), kind);
      return sortDir === "asc" ? base : -base;
    });
    return copy;
  }, [movies, sortKey, sortDir]);

  const onToggle = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    }
  };

  const statusLabels: Record<string, string> = {
    watched: "視聴済",
    wishlist: "視たい"
  };
  
  const jpDate = (dateStr?: string | null) => {
    if (!dateStr) return "";

    return new Date(dateStr).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
  };

  if (!movies || !movies.length) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-gray-500">まだ登録された映画がありません！</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-row justify-between w-full mb-4 items-center">
        <h2 className="text-xl font-semibold">登録映画一覧</h2>
        <div className="flex gap-2">
          {selectedMovieId ? (
            <Link href={`/main/registration?editId=${selectedMovieId}`}>
              <Button
                variant="outline"
                className="bg-blue-600 border-none text-white shadow-sm transition hover:bg-blue-500"
              >
                編集
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              disabled
              className="bg-zinc-800 border-none text-zinc-500 cursor-not-allowed shadow-sm"
            >
              編集
            </Button>
          )}

          <Link className="flex justify-center" href="/main">
            <Button variant="outline" size="icon"
              className=" bg-red-900 border-none text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              <SlActionUndo />
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="py-2 pr-4 font-semibold whitespace-nowrap">
                ポスター
              </th>
              <Th k="title" active={sortKey === "title"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                タイトル
              </Th>
              <Th k="year" active={sortKey === "year"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                年
              </Th>
              <Th k="genres" active={sortKey === "genres"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                ジャンル
              </Th>
              <Th k="status" active={sortKey === "status"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                ステータス
              </Th>
              <Th k="rating" active={sortKey === "rating"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                評価
              </Th>
              <Th k="tmdb_vote_average" active={sortKey === "tmdb_vote_average"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                TMDB平均評価
              </Th>
              <Th k="memo" active={sortKey === "memo"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                メモ
              </Th>
              <Th k="watched_at" active={sortKey === "watched_at"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                視聴日
              </Th>
              <Th k="created_at" active={sortKey === "created_at"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                作成日
              </Th>
              <th className="py-2 pr-2">
              TMDBリンク
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr 
                key={item.id} 
                className={`border-b border-zinc-900/80 cursor-pointer ${
                  selectedMovieId === item.id 
                    ? "bg-zinc-800" 
                    : "hover:bg-zinc-950/60"
                }`}
                onClick={() => setSelectedMovieId(item.id === selectedMovieId ? null : item.id)}
              >
                <td className="py-2 pr-4">
                  {item.movies?.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${item.movies.poster_path}`} alt="poster" className="w-10 h-14 object-cover rounded bg-zinc-800" />
                  ) : (
                    <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500">No Img</div>
                  )}
                </td>
                <td className="py-2 pr-4 max-w-[280px]">
                  <div className="truncate">{item.movies?.title ?? ""}</div>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-red-100">
                  {item.movies?.year ? `${item.movies.year}年` : ""}
                </td>
                <td className="py-2 pr-4 max-w-[220px] text-red-100">
                  <div className="truncate">{item.movies?.genres ? item.movies.genres.join(", ") : ""}</div>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-red-100">{statusLabels[item.status!] ?? item.status ?? ""}</td>
                <td className="py-2 pr-4 whitespace-nowrap text-yellow-400">
                  {item.user_reviews?.rating != null
                    ? String(item.user_reviews.rating)
                    : ""}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-blue-300">
                  {item.movies?.tmdb_vote_average?.toFixed(2) ?? ""}
                </td>
                <td className="py-2 pr-4 max-w-[240px] text-xs text-gray-400">
                  <div className="truncate">{item.memo ?? ""}</div>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-yellow-200">
                  {jpDate(item.watched_at)}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-yellow-200">
                  {jpDate(item.created_at)}
                </td>
                <td className="py-2 pr-2 whitespace-nowrap">
                  {item.movies?.tmdb_id && (
                    <a 
                      href={`https://www.themoviedb.org/movie/${item.movies.tmdb_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-xs underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      TMDB
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
//{jpDate(item.watched_at)}

