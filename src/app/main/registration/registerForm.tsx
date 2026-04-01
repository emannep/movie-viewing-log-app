
'use client'

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SlActionUndo } from "react-icons/sl"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid, parseISO } from "date-fns"
import { FaRegCalendarAlt } from "react-icons/fa"
import { registerMovie, updateMovie } from "@/app/actions/registration"

export default function RegisterForm({ genres, initialData }: { genres: any[], initialData?: any }) {
  const currentYear = new Date().getFullYear()
  const maxYear = currentYear + 10

  const toDateValue = (d: Date) => format(d, "yyyy-MM-dd")
  const parseDateValue = (value: string) => {
    const dt = parseISO(value)
    return isValid(dt) ? dt : undefined
  }

  function DateTextAndCalendarField({
    label,
    name,
    defaultValue,
  }: {
    label: string
    name: string
    defaultValue?: string
  }) {
    const [inputValue, setInputValue] = React.useState(defaultValue ?? "")
    const [selected, setSelected] = React.useState<Date | undefined>(() =>
      defaultValue ? parseDateValue(defaultValue) : undefined
    )

    const handleSelect = (d: Date | undefined) => {
      setSelected(d)
      if (d) setInputValue(toDateValue(d))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      const parsed = parseDateValue(value)
      if (parsed) setSelected(parsed)
    }

    const handleBlur = () => {
      const parsed = parseDateValue(inputValue)
      if (parsed) setInputValue(toDateValue(parsed))
    }

    return (
      <div>
        <label className="block text-sm font-medium">{label}</label>
        <div className="mt-1 flex w-full items-center justify-between gap-2 rounded border px-2 py-1">
          <input
            name={name}
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-[160px] px-2 py-1"
            pattern="\d{4}-\d{2}-\d{2}"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" type="button">
                <FaRegCalendarAlt />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={handleSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }

  const today = toDateValue(new Date())

  const isEdit = !!initialData;
  const actionFn = isEdit ? updateMovie : registerMovie;

  const defaultStatus = initialData?.status ?? "watched";
  const defaultRating = initialData?.user_reviews?.rating ?? "";
  const defaultMemo = initialData?.memo ?? "";
  const defaultWatchedAt = initialData?.watched_at ? toDateValue(new Date(initialData.watched_at)) : today;
  const defaultCreatedAt = initialData?.created_at ? toDateValue(new Date(initialData.created_at)) : today;

  const [title, setTitle] = React.useState(initialData?.movies?.title ?? "");
  const [year, setYear] = React.useState(initialData?.movies?.year ?? "");
  const [genre, setGenre] = React.useState(initialData?.movies?.genres?.[0] ?? "");
  
  const [tmdbId, setTmdbId] = React.useState(initialData?.movies?.tmdb_id ?? "");
  const [posterPath, setPosterPath] = React.useState(initialData?.movies?.poster_path ?? "");
  const [voteAverage, setVoteAverage] = React.useState(initialData?.movies?.tmdb_vote_average ?? "");
  
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  const handleSearch = async () => {
    if (!title) {
      alert("タイトルを入力してください。");
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/tmdb/search?title=${encodeURIComponent(title)}&year=${encodeURIComponent(year)}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results.slice(0, 5));
      } else {
        alert("検索結果がありませんでした。");
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました。");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMovie = (m: any) => {
    setTitle(m.title);
    if (m.release_date) {
      setYear(m.release_date.substring(0, 4));
    }
    setTmdbId(m.id);
    setPosterPath(m.poster_path);
    setVoteAverage(m.vote_average);
    setSearchResults([]);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4">
      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? "映画を編集" : "映画を登録"}</h1>
        <div>
          <Link className="flex justify-center" href="/main">
            <Button
              variant="outline"
              size="icon"
              className="bg-red-900 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              <SlActionUndo />
            </Button>
          </Link>
        </div>
      </div>

      <form action={actionFn} className="space-y-4 rounded-md border p-4 shadow-sm">
        {isEdit && <input type="hidden" name="id" value={initialData.id} />}
        {isEdit && <input type="hidden" name="movie_id" value={initialData.movies.id} />}
        
        <input type="hidden" name="tmdb_id" value={tmdbId} />
        <input type="hidden" name="poster_path" value={posterPath} />
        <input type="hidden" name="tmdb_vote_average" value={voteAverage} />

        <div>
          <label className="block text-sm font-medium">タイトル</label>
          <div className="flex gap-2 items-end">
            <input
              name="title"
              className="mt-1 w-full rounded border px-2 py-1 flex-1"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="mb-[2px]"
            >
              {isSearching ? "検索中..." : "TMDBで検索"}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-2 rounded border bg-zinc-900 shadow p-2">
              <p className="mb-2 text-sm text-zinc-300 font-semibold">検索結果（クリックして反映）:</p>
              <ul className="space-y-1">
                {searchResults.map((m) => (
                  <li 
                    key={m.id} 
                    className="cursor-pointer rounded p-2 hover:bg-zinc-800 transition flex gap-3 items-center"
                    onClick={() => handleSelectMovie(m)}
                  >
                    {m.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt={m.title} className="w-8 h-12 object-cover rounded bg-zinc-800" />
                    ) : (
                      <div className="w-8 h-12 bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500">No Img</div>
                    )}
                    <div>
                      <div className="font-medium text-white">{m.title}</div>
                      <div className="text-xs text-zinc-400">{m.release_date?.substring(0, 4)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">映画公開年度</label>
          <input
            name="year"
            type="number"
            min="1888"
            max={maxYear}
            className="mt-1 w-full rounded border px-2 py-1"
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ジャンル</label>
          <select
            name="genres"
            className="mt-1 w-full rounded border px-2 py-1"
            required
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="">
              ジャンルを選択してください！ （ メインだと思うジャンルを選択 ）
            </option>
            {genres?.map((g: any) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">ステータス</label>
          <select name="status" className="mt-1 w-full rounded border px-2 py-1" defaultValue={defaultStatus}>
            <option value="watched">視聴済</option>
            <option value="wishlist">視たい</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">評価（1〜5）</label>
          <select name="rating" className="mt-1 w-full rounded border px-2 py-1" defaultValue={defaultRating}>
            <option value="0"></option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            name="memo"
            className="mt-1 w-full rounded border px-2 py-1"
            rows={3}
            defaultValue={defaultMemo}
          />
        </div>

        <DateTextAndCalendarField
          label="視聴日"
          name="watched_at"
          defaultValue={defaultWatchedAt}
        />
        <DateTextAndCalendarField
          label="ページ作製日"
          name="created_at"
          defaultValue={defaultCreatedAt}
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {isEdit ? "更新" : "登録"}
        </button>
      </form>
    </div>
  )
}