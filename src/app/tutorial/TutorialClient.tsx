"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { autoRegisterMovies, completeTutorial, type TmdbMovie } from "@/app/actions/tutorial"
import { Button } from "@/components/ui/button"
import PageGuideSlideshowPopup from "@/components/PageGuideSlideshowPopup"
import TutorialRegistrationGuide from "@/components/TutorialRegistrationGuide"
import Image from "next/image";

const TUTORIAL_GENRES = [
  { name: "アクション",     tmdbId: 28 },
  { name: "アドベンチャー", tmdbId: 12 },
  { name: "アニメーション", tmdbId: 16 },
  { name: "コメディ",       tmdbId: 35 },
  { name: "ドラマ",         tmdbId: 18 },
  { name: "ファンタジー",   tmdbId: 14 },
  { name: "ホラー",         tmdbId: 27 },
  { name: "ミステリー",     tmdbId: 9648 },
  { name: "ロマンス",       tmdbId: 10749 },
  { name: "SF",             tmdbId: 878 },
  { name: "スリラー",       tmdbId: 53 },
  { name: "歴史",           tmdbId: 36 },
]

const TMDB_IMG_SM = "https://image.tmdb.org/t/p/w92"

// ステップ定義:
// 1: ページ紹介スライドショー
// 2: 登録ページ説明
// 3: ジャンル選択
// 4: ガイド付き登録
// 5: 完了

export default function TutorialClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState<{ name: string; tmdbId: number } | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null)
  const [autoMovies, setAutoMovies] = useState<TmdbMovie[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isAutoRegistering, setIsAutoRegistering] = useState(false)
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
      const top: TmdbMovie[] = data.results.slice(0, 3)
      setSelectedMovie(top[0])
      setAutoMovies(top.slice(1))
      setStep(4)
    } catch {
      setError("映画の取得に失敗しました。")
    } finally {
      setIsFetching(false)
    }
  }

  async function handleRegistrationComplete() {
    setIsAutoRegistering(true)
    try {
      if (autoMovies.length > 0) {
        await autoRegisterMovies(autoMovies)
      }
      await completeTutorial()
      setStep(5)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
    } finally {
      setIsAutoRegistering(false)
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

  // ── Step 1: ページ紹介スライドショー ──────────────────
  if (step === 1) {
    return <PageGuideSlideshowPopup onComplete={() => setStep(2)} />
  }

  // ── Step 2: 登録ページ説明 ────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#0c0907] px-4 py-6">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
          <div className="border border-amber-800/50 rounded-sm px-8 py-2 bg-amber-950/20 text-center">
            <div className="text-amber-700/70 text-sm tracking-[0.35em] uppercase">tutorial</div>
            <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">映画登録</h1>
          </div>

          <div className="w-full text-center py-8">
            それでは実際に映画を登録してみましょう！<br />
            最初のコレクションを解放するまでを<br />
            お手伝いします！
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setStep(3)}
              className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-bold text-base"
            >
              はじめる
            </Button>
            <button
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-neutral-500 text-sm text-center hover:text-neutral-400 transition disabled:opacity-50"
            >
              スキップする
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3: ジャンル選択 ───────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#0c0907] px-4 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className={`size-3 rounded-full transition-colors ${i === 0 ? "bg-amber-400" : "bg-zinc-700"}`} />
              ))}
            </div>
            <p className="text-amber-300 font-bold text-lg text-center">好きなジャンルを選んでください</p>
            <p className="text-neutral-400 text-sm text-center">そのジャンルの人気映画を一緒に登録します</p>
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
              スキップして自分で登録する
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 4: ガイド付き登録 ────────────────────────────
  if (step === 4) {
    if (isAutoRegistering) {
      return (
        <div className="min-h-screen bg-[#0c0907] flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-5xl">🎬</p>
            <p className="text-amber-300 text-xl font-bold">あと{autoMovies.length}本を自動登録中...</p>
            <p className="text-neutral-400 text-sm">しばらくお待ちください</p>
          </div>
        </div>
      )
    }
    if (selectedMovie) {
      return (
        <TutorialRegistrationGuide
          movie={selectedMovie}
          onComplete={handleRegistrationComplete}
        />
      )
    }
  }

  // ── Step 5: 完了 ───────────────────────────────────────
  const allMovies = [selectedMovie, ...autoMovies].filter(Boolean) as TmdbMovie[]

  return (
    <div className="min-h-screen bg-[#0c0907] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <p className="text-7xl">🏆</p>
        <div className="text-center">
          <p className="text-2xl text-amber-300 font-bold mb-2">博物館が完成しました！</p>
          <p className="text-neutral-300 text-base">
            {selectedGenre?.name}の映画{allMovies.length}本を<br />視聴済みで登録しました
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {allMovies.map((m) => m.poster_path && (
            <Image
              key={m.id}
              src={`${TMDB_IMG_SM}${m.poster_path}`}
              alt={m.title}
              className="rounded-lg object-cover border border-amber-900/30 shadow-md"
              style={{ width: "70px", height: "105px" }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-amber-300 font-bold text-lg mb-1">最初の展示室が解放されました！</p>
          <p className="text-neutral-400 text-sm">
            展示室の映画を見たり、新しい映画を登録したり、<br />自由に楽しんでください！
          </p>
        </div>

        <Button
          onClick={() => router.push("/main")}
          className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-bold text-base"
        >
          ホームへ行く
        </Button>
      </div>
    </div>
  )
}
