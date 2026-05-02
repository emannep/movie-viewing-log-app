"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { autoRegisterMovies, completeTutorial, type TmdbMovie } from "@/app/actions/tutorial"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

// チュートリアルに表示するジャンル（よく知られたものを絞り込む）
const TUTORIAL_GENRES = [
  { name: "アクション",       tmdbId: 28 },
  { name: "アドベンチャー",   tmdbId: 12 },
  { name: "アニメーション",   tmdbId: 16 },
  { name: "コメディ",         tmdbId: 35 },
  { name: "ドラマ",           tmdbId: 18 },
  { name: "ファンタジー",     tmdbId: 14 },
  { name: "ホラー",           tmdbId: 27 },
  { name: "ミステリー",       tmdbId: 9648 },
  { name: "ロマンス",         tmdbId: 10749 },
  { name: "SF",               tmdbId: 878 },
  { name: "スリラー",         tmdbId: 53 },
  { name: "歴史",             tmdbId: 36 },
]

const TMDB_IMG_SM = "https://image.tmdb.org/t/p/w92"
const TMDB_IMG_MD = "https://image.tmdb.org/t/p/w185"

// 登録ページの各項目説明
const FIELD_EXPLANATIONS = [
  { num: "①", label: "タイトル検索",  desc: "タイトルを入力してTMDB検索ボタンを押すと、映画の詳細情報（年代・ジャンル）が自動入力されます" },
  { num: "②", label: "ステータス",    desc: "「視聴済み」か「観たい」を選択。視聴済みにすると評価もつけられます" },
  { num: "③", label: "メモ",          desc: "感想や覚えておきたいことを自由に書けます（任意）" },
]

export default function TutorialClient() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedGenre, setSelectedGenre] = useState<{ name: string; tmdbId: number } | null>(null)
  const [suggestedMovies, setSuggestedMovies] = useState<TmdbMovie[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState("")
  const [isSkipping, setIsSkipping] = useState(false)

  async function handleGenreNext() {
    if (!selectedGenre) return
    setIsFetching(true)
    setError("")
    try {
      const res = await fetch(`/api/tmdb/discover?genre_id=${selectedGenre.tmdbId}`)
      const data = await res.json()
      if (!data.results?.length) {
        setError("映画の取得に失敗しました。別のジャンルをお試しください。")
        setIsFetching(false)
        return
      }
      setSuggestedMovies(data.results)
      setStep(2)
    } catch {
      setError("映画の取得に失敗しました。")
    } finally {
      setIsFetching(false)
    }
  }

  async function handleAutoRegister() {
    setIsRegistering(true)
    setError("")
    try {
      const result = await autoRegisterMovies(suggestedMovies)
      if (result && "error" in result) {
        setError(result.error)
        return
      }
      await completeTutorial()
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : "登録中にエラーが発生しました")
    } finally {
      setIsRegistering(false)
    }
  }

  async function handleSkip() {
    setIsSkipping(true)
    try {
      await completeTutorial()
      router.push("/main")
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
    } finally {
      setIsSkipping(false)
    }
  }

  const Header = () => (
    <div className="border border-amber-800/50 rounded-sm px-8 py-3 bg-amber-950/20 text-center">
      <p className="text-amber-700/70 text-sm tracking-[0.35em] uppercase mb-1">Film Museum</p>
      <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">あなたの映画博物館</h1>
    </div>
  )

  // ── Step 0: 登録ページ説明 ─────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#0c0907] px-4 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Header />
            <p className="text-neutral-400 text-sm tracking-widest uppercase">使い方</p>
          </div>

          <p className="text-neutral-300 text-base text-center leading-relaxed">
            映画を登録するとおすすめが表示され、<br />
            コレクションが解放されていきます。
          </p>

          {/* 登録ページのスクショ＋吹き出し */}
          <div className="relative mx-auto" style={{ width: "240px" }}>
            <Image
              src="/screenshots/registration.png"
              alt="登録ページ"
              width={425}
              height={870}
              className="w-full rounded-xl border border-amber-900/30 shadow-lg"
            />
            {/* ① タイトル検索 (上部 ~19%) */}
            <div className="absolute flex items-center gap-1" style={{ top: "16%", right: "-56px" }}>
              <div className="h-px w-5 bg-amber-500/60" />
              <span className="text-amber-400 font-bold text-sm bg-amber-950/80 rounded-full w-6 h-6 flex items-center justify-center border border-amber-700/50">①</span>
            </div>
            {/* ② ステータス (~53%) */}
            <div className="absolute flex items-center gap-1" style={{ top: "51%", right: "-56px" }}>
              <div className="h-px w-5 bg-amber-500/60" />
              <span className="text-amber-400 font-bold text-sm bg-amber-950/80 rounded-full w-6 h-6 flex items-center justify-center border border-amber-700/50">②</span>
            </div>
            {/* ③ メモ (~65%) */}
            <div className="absolute flex items-center gap-1" style={{ top: "64%", right: "-56px" }}>
              <div className="h-px w-5 bg-amber-500/60" />
              <span className="text-amber-400 font-bold text-sm bg-amber-950/80 rounded-full w-6 h-6 flex items-center justify-center border border-amber-700/50">③</span>
            </div>
          </div>

          {/* 説明リスト */}
          <div className="flex flex-col gap-3 rounded-xl bg-zinc-900/60 border border-amber-900/20 px-4 py-4">
            {FIELD_EXPLANATIONS.map(({ num, label, desc }) => (
              <div key={num} className="flex gap-3 items-start">
                <span className="text-amber-400 font-bold text-sm bg-amber-950/80 rounded-full w-6 h-6 flex items-center justify-center border border-amber-700/50 flex-shrink-0 mt-0.5">
                  {num}
                </span>
                <div>
                  <p className="text-amber-300 text-sm font-semibold">{label}</p>
                  <p className="text-neutral-400 text-xs leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setStep(1)}
              className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-bold text-base"
            >
              はじめる
            </Button>
            <button
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-neutral-500 text-sm text-center hover:text-neutral-400 transition disabled:opacity-50"
            >
              スキップして後で自分で登録する
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: ジャンル選択 ───────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0c0907] px-4 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === 0 ? "bg-amber-400" : "bg-zinc-700"}`} />
              ))}
            </div>
            <p className="text-amber-300 font-bold text-lg text-center">好きなジャンルを選んでください</p>
            <p className="text-neutral-400 text-sm text-center">そのジャンルの人気映画を3本自動で登録します</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TUTORIAL_GENRES.map((g) => (
              <button
                key={g.tmdbId}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`py-2.5 px-1 rounded-xl text-sm font-semibold transition border ${
                  selectedGenre?.tmdbId === g.tmdbId
                    ? "bg-amber-800 border-amber-600 text-amber-100"
                    : "bg-zinc-900 border-amber-900/20 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGenreNext}
              disabled={!selectedGenre || isFetching}
              className="w-full h-12 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-base"
            >
              {isFetching ? "映画を選出中..." : "次へ"}
            </Button>
            <button
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-neutral-500 text-sm text-center hover:text-neutral-400 transition disabled:opacity-50"
            >
              スキップして後で自分で登録する
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: 映画確認 ───────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#0c0907] px-4 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i <= 1 ? "bg-amber-500" : "bg-zinc-700"}`} />
              ))}
            </div>
            <p className="text-amber-300 font-bold text-lg text-center">この3本を登録します</p>
            <p className="text-neutral-400 text-sm text-center">
              {selectedGenre?.name}の人気映画 / 視聴済み ⭐️⭐️⭐️⭐️⭐️
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {suggestedMovies.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl bg-zinc-900/80 border border-amber-900/20 p-3">
                {m.poster_path ? (
                  <img
                    src={`${TMDB_IMG_MD}${m.poster_path}`}
                    alt=""
                    className="rounded flex-shrink-0 object-cover"
                    style={{ width: "52px", height: "78px" }}
                  />
                ) : (
                  <div className="rounded flex-shrink-0 bg-zinc-800" style={{ width: "52px", height: "78px" }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-100 font-semibold text-sm line-clamp-2">{m.title}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{m.release_date?.substring(0, 4)}</p>
                  <div className="flex gap-0.5 mt-1.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAutoRegister}
              disabled={isRegistering}
              className="w-full h-12 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-base"
            >
              {isRegistering ? "登録中..." : "この3本を登録する"}
            </Button>
            <button
              type="button"
              onClick={() => { setStep(1); setSelectedGenre(null); setSuggestedMovies([]); setError("") }}
              className="text-neutral-500 text-sm text-center hover:text-neutral-400 transition"
            >
              ジャンルを選び直す
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3: 完了 ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0c0907] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <p className="text-7xl">🏆</p>
        <div className="text-center">
          <p className="text-2xl text-amber-300 font-bold mb-2">博物館が完成しました！</p>
          <p className="text-neutral-300 text-base">
            {selectedGenre?.name}の映画3本を<br />視聴済みで登録しました
          </p>
        </div>

        {/* 登録した映画サムネイル */}
        <div className="flex gap-2 justify-center">
          {suggestedMovies.map((m) => m.poster_path && (
            <img
              key={m.id}
              src={`${TMDB_IMG_SM}${m.poster_path}`}
              alt={m.title}
              className="rounded-lg object-cover border border-amber-900/30 shadow-md"
              style={{ width: "60px", height: "90px" }}
            />
          ))}
        </div>

        <Button
          onClick={() => router.push("/main")}
          className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-bold text-base"
        >
          博物館へ行く
        </Button>
      </div>
    </div>
  )
}
