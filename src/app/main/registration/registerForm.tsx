'use client'

import * as React from "react"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, isValid, parseISO } from "date-fns"
import { FaRegCalendarAlt } from "react-icons/fa"
import { registerMovie, updateMovie } from "@/app/actions/registration"
import { ChevronLeft, X } from "lucide-react"
import { ja } from "date-fns/locale"


const TMDB_IMG = "https://image.tmdb.org/t/p/w92";

const TMDB_GENRE_MAP: Record<number, string> = {
  28: "アクション",
  12: "アドベンチャー",
  16: "アニメーション",
  35: "コメディ",
  80: "犯罪",
  99: "ドキュメンタリー",
  18: "ドラマ",
  10751: "ファミリー",
  14: "ファンタジー",
  36: "歴史",
  27: "ホラー",
  10402: "音楽",
  9648: "ミステリー",
  10749: "ロマンス",
  878: "SF",
  10770: "TVムービー",
  53: "スリラー",
  10752: "戦争",
  37: "西部劇",
};

const fieldClass =
  "w-full rounded-lg bg-zinc-900 border border-amber-900/30 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-700/60 transition-colors";

const labelClass = "block text-xs text-amber-700/80 tracking-widest uppercase mb-1";

const sectionClass =
  "bg-zinc-900/60 border border-amber-900/20 rounded-xl p-3 flex flex-col gap-2";

const toDateValue = (d: Date) => format(d, "yyyy-MM-dd");
const parseDateValue = (value: string) => {
  const dt = parseISO(value);
  return isValid(dt) ? dt : undefined;
};

function DateTextAndCalendarField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  const inputId = React.useId();
  const [inputValue, setInputValue] = React.useState(defaultValue ?? "");
  const [selected, setSelected] = React.useState<Date | undefined>(() =>
    defaultValue ? parseDateValue(defaultValue) : undefined
  );

  const handleSelect = (d: Date | undefined) => {
    setSelected(d);
    if (d) setInputValue(toDateValue(d));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsed = parseDateValue(value);
    if (parsed) setSelected(parsed);
  };

  const handleBlur = () => {
    const parsed = parseDateValue(inputValue);
    if (parsed) setInputValue(toDateValue(parsed));
  };

  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>{label}</label>
      <div className="flex w-full items-center gap-2 rounded-lg border border-amber-900/30 bg-zinc-900 px-3 py-2">
        <input
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
          pattern="\d{4}-\d{2}-\d{2}"
        />
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-amber-700 hover:text-amber-500 transition-colors"
            >
              <FaRegCalendarAlt size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-900 border-amber-900/40" align="start">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              locale={ja}
              captionLayout="dropdown"
              className="[--cell-size:2.5rem] text-zinc-100"
              classNames={{
                month_caption: "flex justify-center items-center h-[--cell-size] w-full px-[--cell-size] text-amber-500/90 font-semibold",
                dropdowns: "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
                dropdown_root: "relative rounded-lg border border-amber-900/30 bg-zinc-900",
                caption_label: "flex items-center gap-1 px-2 py-1 text-sm text-zinc-100 select-none",
                weekday: "w-full text-amber-700/60",
                today: "bg-amber-900/40 text-amber-300 rounded-md data-[selected=true]:rounded-none",
                outside: "text-zinc-600 opacity-50",
                disabled: "text-zinc-700 opacity-40",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default function RegisterForm({ genres, initialData }: { genres: any[]; initialData?: any }) {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 10;

  const today = toDateValue(new Date());
  const isEdit = !!initialData;
  const actionFn = isEdit ? updateMovie : registerMovie;

  const defaultStatus = initialData?.status ?? "wishlist";
  const defaultRating = initialData?.user_reviews?.rating ?? "";
  const defaultMemo = initialData?.memo ?? "";
  const defaultWatchedAt = initialData?.watched_at
    ? toDateValue(new Date(initialData.watched_at))
    : undefined;


  const [title, setTitle] = React.useState(initialData?.movies?.title ?? "");
  const [year, setYear] = React.useState(initialData?.movies?.year ?? "");
  const [genre, setGenre] = React.useState(initialData?.movies?.genres?.[0] ?? "");
  const [tmdbId, setTmdbId] = React.useState(initialData?.movies?.tmdb_id ?? "");
  const [posterPath, setPosterPath] = React.useState(initialData?.movies?.poster_path ?? "");
  const [voteAverage, setVoteAverage] = React.useState(initialData?.movies?.tmdb_vote_average ?? "");
  const [status, setStatus] = React.useState(defaultStatus);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  const handleSearch = async () => {
    if (!title) { alert("タイトルを入力してください。"); return; }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `/api/tmdb/search?title=${encodeURIComponent(title)}&year=${encodeURIComponent(year)}`
      );
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results.slice(0, 5));
      } else {
        alert("検索結果がありませんでした。");
      }
    } catch {
      alert("エラーが発生しました。");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMovie = (m: any) => {
    setTitle(m.title);
    if (m.release_date) setYear(m.release_date.substring(0, 4));
    setTmdbId(m.id);
    setPosterPath(m.poster_path);
    setVoteAverage(m.vote_average);
    if (m.genre_ids?.length > 0) {
      for (const gid of m.genre_ids) {
        const tmdbName = TMDB_GENRE_MAP[gid];
        if (tmdbName) {
          const match = genres.find((g: any) => g.name === tmdbName);
          if (match) { setGenre(match.name); break; }
        }
      }
    }
    setSearchResults([]);
  };

  return (
    <div className="w-full flex flex-col gap-3">

      {/* ヘッダー */}
      <header className="flex items-center justify-between pt-1">
        <Link
          href="/main"
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-sm">ホーム</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-amber-900/50" />
          <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">
            {isEdit ? "作品を編集" : "作品を登録"}
          </h1>
          <div className="h-px w-8 bg-amber-900/50" />
        </div>
        <div className="w-16" />
      </header>

      <form action={actionFn} className="flex flex-col gap-3">
        {isEdit && <input type="hidden" name="id" value={initialData.id} />}
        {isEdit && <input type="hidden" name="movie_id" value={initialData.movies.id} />}
        <input type="hidden" name="tmdb_id" value={tmdbId} />
        <input type="hidden" name="poster_path" value={posterPath} />
        <input type="hidden" name="tmdb_vote_average" value={voteAverage} />

        {/* タイトル検索 */}
        <div className={sectionClass}>
          <div className="relative">
            <label className={labelClass}>映画情報入力（TMDB検索で映画詳細を自動入力）</label>
            <div className="flex gap-2 items-center">
              <input
                name="title"
                className={`${fieldClass} flex-1`}
                required
                value={title}
                placeholder="映画タイトル"
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="shrink-0 bg-amber-900/60 hover:bg-amber-800/70 disabled:opacity-50 text-amber-200 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
              >
                {isSearching ? "検索中..." : "タイトルからTMDB検索"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-amber-900/40 bg-zinc-900 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 pt-2 pb-1">
                  <p className="text-[12px] text-amber-700/70 tracking-widest uppercase">
                    検索結果（タップして映画詳細に自動入力）
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchResults([])}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <ul>
                  {searchResults.map((m) => (
                    <li
                      key={m.id}
                      className="cursor-pointer flex gap-3 items-center px-3 py-2 hover:bg-amber-900/20 active:bg-amber-900/40 transition-colors border-t border-amber-900/20"
                      onClick={() => handleSelectMovie(m)}
                    >
                      {m.poster_path ? (
                        <img
                          src={`${TMDB_IMG}${m.poster_path}`}
                          alt={m.title}
                          className="w-8 h-12 object-cover rounded bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                          No Img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-100 text-sm font-medium truncate">{m.title}</p>
                        <p className="text-amber-700/70 text-xs">{m.release_date?.substring(0, 4)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 映画詳細（折りたたみ） */}
        <Accordion type="single" collapsible defaultValue={isEdit ? "movie-details" : undefined} className="bg-zinc-900/60 border border-amber-900/20 rounded-xl flex flex-col">
          <AccordionItem value="movie-details" className="border-none">
            <AccordionTrigger className="px-3 py-3 text-xs text-amber-700/80 tracking-widest uppercase hover:no-underline hover:text-amber-500/80 transition-colors [&>svg]:text-amber-700/60">
              映画詳細（年代とジャンルを手動入力）
            </AccordionTrigger>
            <AccordionContent forceMount className="px-3 pb-3 flex flex-col gap-2">
              <div>
                <label className={labelClass}>公開年度</label>
                <input
                  name="year"
                  type="number"
                  min="1888"
                  max={maxYear}
                  className={fieldClass}
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>ジャンル</label>
                <Select name="genres" required value={genre} onValueChange={setGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="ジャンルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres?.map((g: any) => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 鑑賞記録 */}
        <div className={sectionClass}>
          <div>
            <label className={labelClass}>ステータス</label>
            <Select name="status" value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wishlist">視たい</SelectItem>
                <SelectItem value="watched">視聴済</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "watched" && (
            <div>
              <label className={labelClass}>評価（1〜5）</label>
              <Select name="rating" defaultValue={defaultRating !== "" ? String(defaultRating) : "0"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">未評価</SelectItem>
                  <SelectItem value="1">★☆☆☆☆</SelectItem>
                  <SelectItem value="2">★★☆☆☆</SelectItem>
                  <SelectItem value="3">★★★☆☆</SelectItem>
                  <SelectItem value="4">★★★★☆</SelectItem>
                  <SelectItem value="5">★★★★★</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className={labelClass}>メモ</label>
            <textarea
              name="memo"
              className={`${fieldClass} resize-none`}
              rows={2}
              placeholder="感想・メモ"
              defaultValue={defaultMemo}
            />
          </div>

          {status === "watched" && (
            <DateTextAndCalendarField label="視聴日" name="watched_at" defaultValue={defaultWatchedAt} />
          )}
          <input type="hidden" name="created_at" value={today} />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 font-semibold text-sm tracking-wide transition-colors shadow-lg shadow-amber-950/30"
        >
          {isEdit ? "更新する" : "登録する"}
        </button>
      </form>
    </div>
  );
}
