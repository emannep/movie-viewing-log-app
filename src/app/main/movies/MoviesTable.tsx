"use client";

import * as React from "react";

type UserMovieRow = {
  id: string;
  status?: string | null;
  memo?: string | null;
  watched_at?: string | null;
  created_at?: string | null;
  movies?: Array<{
    id?: string | null;
    title?: string | null;
    year?: number | string | null;
    genres?: string | null;
    tmdb_id?: number | string | null;
    imdb_id?: string | null;
  }> | null;
  user_reviews?: Array<{
    rating?: number | string | null;
    review?: string | null;
  }> | null;
};

type SortKey =
  | "title"
  | "year"
  | "genres"
  | "status"
  | "rating"
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
  const movie = row.movies?.[0];
  switch (key) {
    case "title":
      return movie?.title ?? "";
    case "year":
      return movie?.year ?? null;
    case "genres":
      return movie?.genres ?? "";
    case "status":
      return row.status ?? "";
    case "rating":
      return row.user_reviews?.[0]?.rating ?? null;
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
        className="inline-flex items-center whitespace-nowrap font-semibold text-zinc-200 hover:text-white"
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

  if (!movies || !movies.length) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-gray-500">まだ登録された映画がありません！</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
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
              <Th k="memo" active={sortKey === "memo"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                メモ
              </Th>
              <Th k="watched_at" active={sortKey === "watched_at"} dir={sortDir} onToggle={onToggle} className="py-2 pr-4">
                視聴日
              </Th>
              <Th k="created_at" active={sortKey === "created_at"} dir={sortDir} onToggle={onToggle} className="py-2 pr-2">
                作成日
              </Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className="border-b border-zinc-900/80 hover:bg-zinc-950/60">
                <td className="py-2 pr-4 max-w-[280px]">
                  <div className="truncate">{item.movies?.[0]?.title ?? ""}</div>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-red-100">
                  {item.movies?.[0]?.year ? `${item.movies[0]?.year}年` : ""}
                </td>
                <td className="py-2 pr-4 max-w-[220px] text-red-100">
                  <div className="truncate">{item.movies?.[0]?.genres ?? ""}</div>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-red-100">{item.status ?? ""}</td>
                <td className="py-2 pr-4 whitespace-nowrap text-yellow-400">
                  {item.user_reviews?.[0]?.rating !== null &&
                  item.user_reviews?.[0]?.rating !== undefined &&
                  item.user_reviews?.[0]?.rating !== ""
                    ? String(item.user_reviews?.[0]?.rating)
                    : ""}
                </td>
                <td className="py-2 pr-4 max-w-[240px] text-xs text-gray-400">
                  <div className="truncate">{item.memo ?? ""}</div>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-yellow-200">
                  {item.watched_at ? String(item.watched_at) : ""}
                </td>
                <td className="py-2 pr-2 whitespace-nowrap text-yellow-200">
                  {item.created_at ? String(item.created_at) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

