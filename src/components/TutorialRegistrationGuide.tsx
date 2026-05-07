"use client"

import { useState } from "react"
import { ChevronLeft, ChevronDown } from "lucide-react"
import { FaRegCalendarAlt } from "react-icons/fa"
import { format } from "date-fns"
import { GENRES } from "@/lib/genre-map"
import { autoRegisterMovies, type TmdbMovie } from "@/app/actions/tutorial"
import Image from "next/image";

const TMDB_IMG_SM = "https://image.tmdb.org/t/p/w92"

const TMDB_GENRE_MAP: Record<number, string> = {
  28: "アクション", 12: "アドベンチャー", 16: "アニメーション",
  35: "コメディ", 80: "犯罪", 99: "ドキュメンタリー", 18: "ドラマ",
  10751: "ファミリー", 14: "ファンタジー", 36: "歴史", 27: "ホラー",
  10402: "音楽", 9648: "ミステリー", 10749: "ロマンス", 878: "SF",
  10770: "TVムービー", 53: "スリラー", 10752: "戦争", 37: "西部劇",
}

const STEPS = [
  { tooltip: "それでは実際に登録をして行きます！", sub: "タップして始める",       highlight: "intro"  },
  { tooltip: "タイトル欄に映画名を入力します",     sub: "どこかをタップして進む", highlight: "title"  },
  { tooltip: "TMDB検索で映画情報を取得します",     sub: "どこかをタップして進む", highlight: "search" },
  { tooltip: "検索結果から映画を選択します",        sub: "どこかをタップして進む", highlight: "result" },
  { tooltip: "ステータスを「視聴済」にします",      sub: "どこかをタップして進む", highlight: "status" },
  { tooltip: "評価を★5にします",                   sub: "どこかをタップして進む", highlight: "rating" },
  { tooltip: "登録日を選択します",                  sub: "どこかをタップして進む", highlight: "date"   },
  { tooltip: "登録ボタンで映画を登録します！",      sub: "どこかをタップして完了", highlight: "submit" },
] as const

type Hl = typeof STEPS[number]["highlight"]

const fieldClass = "w-full rounded-lg bg-zinc-900 border border-amber-900/30 px-3 py-2 text-base text-zinc-100 placeholder-neutral-300"
const labelClass = "block text-sm text-amber-600/90 tracking-widest uppercase mb-1"
const sectionCls = "bg-zinc-900/60 border border-amber-900/20 rounded-xl p-3 flex flex-col gap-2"
const glowCls    = "ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.5)]"

export default function TutorialRegistrationGuide({
  movie,
  onComplete,
}: {
  movie: TmdbMovie
  onComplete: () => void
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState("")

  const step = STEPS[stepIndex]

  // 各ステップの UI 状態
  const title       = stepIndex >= 2 ? movie.title : ""
  const year        = stepIndex >= 4 ? (movie.release_date?.substring(0, 4) ?? "") : ""
  const genre       = stepIndex >= 4 ? ((movie.genre_ids ?? []).map(id => TMDB_GENRE_MAP[id]).find(Boolean) ?? "") : ""
  const showResult  = stepIndex === 3
  const detailsOpen = stepIndex >= 4
  const watched     = stepIndex >= 5
  const rating      = stepIndex >= 6 ? 5 : 0
  const today       = format(new Date(), "yyyy-MM-dd")

  const hl  = (h: Hl) => step.highlight === h
  const glow = (h: Hl) => hl(h) ? glowCls : ""

  // intro: 全体を opacity-50、それ以外: 対象外は opacity-30
  function dim(...hs: Hl[]) {
    if (step.highlight === "intro") return "opacity-50"
    return hs.some(h => hl(h)) ? "" : "opacity-30"
  }
  // アコーディオン: step4以降は dimしない（入力済みの参照情報として表示）
  function accordionDim() {
    if (step.highlight === "intro") return "opacity-50"
    if (["title", "search", "result"].includes(step.highlight)) return "opacity-30"
    return ""
  }

  async function handleAdvance() {
    if (isRegistering) return
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(s => s + 1)
    } else {
      setIsRegistering(true)
      try {
        const result = await autoRegisterMovies([movie])
        if (result && "error" in result) {
          setError(result.error)
          setIsRegistering(false)
          return
        }
        onComplete()
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました")
        setIsRegistering(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0907] relative">

      {/* 全画面クリックキャプチャー（z-30） */}
      <div className="fixed inset-0 z-30 cursor-pointer" onClick={handleAdvance} />

      <div className="w-full flex flex-col gap-3 px-4 py-4 pb-44">

        {/* ヘッダー */}
        <header className="relative flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-neutral-300">
            <ChevronLeft size={16} />
            <span className="text-base">ホーム</span>
          </div>
          <div className="absolute inset-x-0 flex items-center justify-center gap-3 pointer-events-none">
            <div className="h-px w-16 bg-amber-300/50" />
            <h1 className="text-amber-300 text-lg tracking-[0.3em] uppercase">作品を登録</h1>
            <div className="h-px w-16 bg-amber-300/50" />
          </div>
        </header>

        {/* タイトル + TMDB検索 */}
        <div className={`${sectionCls} transition-all duration-300 ${dim("title", "search", "result")}`}>
          <label className="text-base text-amber-600/90 tracking-widest uppercase">
            映画情報入力（TMDB検索で映画詳細を自動入力）
          </label>
          <div className="flex gap-2 items-center">
            {/* タイトル入力欄 */}
            <div className={`flex-1 rounded-lg bg-zinc-900 border px-3 py-2 text-base transition-all duration-300 ${
              hl("title")
                ? `border-amber-400 text-zinc-100 ${glowCls}`
                : "border-amber-900/30 text-zinc-100"
            }`}>
              {title ? title : <span className="text-neutral-500">映画タイトル</span>}
            </div>
            {/* TMDB検索ボタン */}
            <div className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
              hl("search")
                ? `bg-amber-900/60 text-amber-200 ${glowCls}`
                : "bg-amber-900/60 text-amber-200/50"
            }`}>
              タイトルからTMDB検索
            </div>
          </div>

          {/* 検索結果ドロップダウン */}
          {showResult && (
            <div className={`rounded-lg border border-amber-900/40 bg-zinc-900 shadow-xl overflow-hidden transition-all duration-300 ${glow("result")}`}>
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <p className="text-sm text-amber-600/90 tracking-widest uppercase">
                  検索結果（タップして映画詳細に自動入力）
                </p>
              </div>
              <div className={`flex gap-3 items-center px-3 py-2 border-t border-amber-900/20 transition-colors ${hl("result") ? "bg-amber-900/20" : ""}`}>
                {movie.poster_path
                  ? <Image src={`${TMDB_IMG_SM}${movie.poster_path}`} alt={movie.title} className="w-8 h-12 object-cover rounded bg-zinc-800 shrink-0" />
                  : <div className="w-8 h-12 bg-zinc-800 rounded shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-100 text-base font-medium truncate">{movie.title}</p>
                  <p className="text-amber-600/90 text-sm">{movie.release_date?.substring(0, 4)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 映画詳細アコーディオン */}
        <div className={`bg-zinc-900/60 border border-amber-900/20 rounded-xl flex flex-col transition-all duration-300 ${accordionDim()}`}>
          <div className="flex items-center justify-between px-3 py-3">
            <span className="text-base text-amber-600/90 tracking-widest uppercase">
              映画詳細（年代とジャンルを手動入力）
            </span>
            <ChevronDown size={16} className={`text-amber-700/60 transition-transform duration-300 ${detailsOpen ? "rotate-180" : ""}`} />
          </div>
          {detailsOpen && (
            <div className="px-3 pb-3 flex flex-col gap-2">
              {/* 公開年度 */}
              <div>
                <label className={labelClass}>公開年度</label>
                <div className="flex w-full items-center gap-2 rounded-lg border border-amber-900/30 bg-zinc-900 px-3 py-2">
                  <span className="flex-1 text-base text-zinc-100">{year}</span>
                  <ChevronDown className="text-amber-700/90" size={16} />
                </div>
              </div>
              {/* ジャンル */}
              <div>
                <label className={labelClass}>ジャンル</label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((g) => (
                    <div
                      key={g.name}
                      className={`text-sm px-2.5 py-1 rounded-full border transition-colors ${
                        genre === g.name
                          ? "bg-amber-800/60 border-amber-600/60 text-amber-200"
                          : "bg-zinc-900 border-neutral-300/50 text-neutral-300"
                      }`}
                    >
                      {g.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 鑑賞記録セクション */}
        <div className={`${sectionCls} transition-all duration-300 ${dim("status", "rating", "date")} ${glow("status")}`}>
          {/* ステータス */}
          <div>
            <label className={labelClass}>ステータス</label>
            <div className="flex rounded-lg border border-amber-900/30 overflow-hidden">
              <div className={`flex-1 py-2 text-base font-medium text-center transition-colors duration-300 ${!watched ? "bg-amber-800 text-amber-100" : "bg-zinc-900 text-zinc-400"}`}>
                視たい
              </div>
              <div className={`flex-1 py-2 text-base font-medium text-center border-l border-amber-900/30 transition-colors duration-300 ${watched ? "bg-amber-800 text-amber-100" : "bg-zinc-900 text-zinc-400"}`}>
                視聴済
              </div>
            </div>
          </div>

          {/* 評価 */}
          {watched && (
            <div className={`transition-all duration-300 rounded-lg p-1 -m-1 ${glow("rating")}`}>
              <label className={labelClass}>評価（1〜5）</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 0, label: "未評価" },
                  { value: 1, label: "★" },
                  { value: 2, label: "★★" },
                  { value: 3, label: "★★★" },
                  { value: 4, label: "★★★★" },
                  { value: 5, label: "★★★★★" },
                ].map((r) => (
                  <div
                    key={r.value}
                    className={`text-sm px-2.5 py-1 rounded-full border transition-colors ${
                      rating === r.value
                        ? "bg-amber-800/60 border-amber-600/60 text-amber-200"
                        : "bg-zinc-900 border-neutral-300/50 text-neutral-300"
                    }`}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* メモ */}
          <div>
            <label className={labelClass}>メモ</label>
            <div className={`${fieldClass} min-h-12`} />
          </div>

          {/* 視聴日 */}
          {watched && (
            <div className={`transition-all duration-300 rounded-lg p-1 -m-1 ${glow("date")}`}>
              <label className={labelClass}>視聴日</label>
              <div className="flex w-full items-center gap-2 rounded-lg border border-amber-900/30 bg-zinc-900 px-3 py-2">
                <span className="flex-1 text-base text-zinc-100">{today}</span>
                <FaRegCalendarAlt size={16} className="text-amber-700" />
              </div>
            </div>
          )}
        </div>

        {/* 登録ボタン */}
        <div className={`transition-all duration-300 rounded-xl ${dim("submit")} ${glow("submit")}`}>
          <div className={`w-full py-3 rounded-xl text-center font-semibold text-base tracking-wide shadow-lg shadow-amber-950/30 transition-colors duration-300 ${
            hl("submit") ? "bg-amber-800 text-amber-100" : "bg-amber-800/30 text-amber-300/40"
          }`}>
            {isRegistering ? "送信中..." : "登録する"}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* ツールチップ（z-40） */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-sm mx-auto bg-zinc-900/95 border border-amber-700/60 rounded-2xl px-5 py-4 shadow-2xl">
          <div className="flex justify-center gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === stepIndex ? "w-5 h-2 bg-amber-400" :
                  i < stepIndex  ? "size-2 bg-amber-700" :
                  "size-2 bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <p className="text-amber-300 font-bold text-center text-base">{step.tooltip}</p>
          <p className="text-neutral-400 text-sm text-center mt-1">
            {isRegistering ? "登録中..." : step.sub}
          </p>
        </div>
      </div>
    </div>
  )
}
