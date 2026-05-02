"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { checkAndUnlockCollections, getUnlockedGenres } from "./collections"
import { awardPoints } from "./points"

export type TutorialFormState = { error: string } | { success: true } | null

function parseYear(yearRaw: FormDataEntryValue | null, maxYear: number): { year: number | null; error?: string } {
  const yearStr = String(yearRaw ?? "").trim()
  if (!yearStr || yearStr === "不明") return { year: null }
  if (!/^\d{4}$/.test(yearStr)) return { year: null, error: "年は4桁の数値で入力してください" }
  const parsed = Number(yearStr)
  if (parsed < 1888 || parsed > maxYear) return { year: null, error: `年は 1888〜${maxYear} の間で入力してください` }
  return { year: parsed }
}

export async function registerMovieTutorial(
  _prevState: TutorialFormState,
  formData: FormData
): Promise<TutorialFormState> {
  const supabase = await createClient()
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) redirect("/auth/login")
  const userId = userRes.user.id

  const title = String(formData.get("title") ?? "").trim()
  const yearRaw = formData.get("year")
  const genresRaw = String(formData.get("genres") ?? "").trim()
  const status = String(formData.get("status") ?? "watched")
  const ratingRaw = formData.get("rating")
  const tmdbIdRaw = formData.get("tmdb_id")
  const posterPathStr = String(formData.get("poster_path") ?? "").trim()
  const tmdbVoteAverageRaw = formData.get("tmdb_vote_average")

  const tmdb_id = tmdbIdRaw ? Number(tmdbIdRaw) : null
  const poster_path = posterPathStr || null
  const tmdb_vote_average = tmdbVoteAverageRaw ? Number(tmdbVoteAverageRaw) : null

  if (!title) return { error: "タイトルは必須です" }

  const maxYear = new Date().getFullYear() + 10
  const parsedYearData = parseYear(yearRaw, maxYear)
  if (parsedYearData.error) return { error: parsedYearData.error }
  const year = parsedYearData.year

  const genresArray = genresRaw === ""
    ? []
    : genresRaw.split(/[、,]/).map((g) => g.trim()).filter((g) => g.length > 0)

  let rating: number | null = null
  if (status !== "wishlist" && ratingRaw !== null && ratingRaw !== "") {
    const parsedRating = Number(ratingRaw)
    if (!Number.isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
      rating = parsedRating
    }
  }

  const watched_at = status === "watched" ? new Date().toISOString() : null

  try {
    const { error } = await supabase.rpc("register_movie_data", {
      _title: title,
      _year: year,
      _genres: genresArray,
      _status: status,
      _rating: rating,
      _memo: null,
      _watched_at: watched_at,
      _created_at: null,
      _poster_path: poster_path,
      _tmdb_id: tmdb_id,
      _tmdb_vote_average: tmdb_vote_average,
    })
    if (error) return { error: error.message }

    if (status === "watched" && genresArray.length > 0) {
      const unlockedGenres = await getUnlockedGenres(userId)
      const isCollectionMovie = genresArray.some((g) => unlockedGenres.has(g))
      await Promise.all([
        awardPoints(userId, isCollectionMovie),
        checkAndUnlockCollections(userId, genresArray),
      ])
    }

    revalidatePath("/main")
    revalidatePath("/main/movies")
    revalidatePath("/main/collection")
  } catch (e) {
    console.error("tutorial 登録エラー:", e)
    return { error: "登録中にエラーが発生しました" }
  }

  return { success: true }
}

export type TmdbMovie = {
  id: number
  title: string
  release_date?: string
  poster_path?: string | null
  vote_average?: number
  genre_ids?: number[]
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: "アクション", 12: "アドベンチャー", 16: "アニメーション",
  35: "コメディ", 80: "犯罪", 99: "ドキュメンタリー", 18: "ドラマ",
  10751: "ファミリー", 14: "ファンタジー", 36: "歴史", 27: "ホラー",
  10402: "音楽", 9648: "ミステリー", 10749: "ロマンス", 878: "SF",
  10770: "TVムービー", 53: "スリラー", 10752: "戦争", 37: "西部劇",
}

export async function autoRegisterMovies(
  movies: TmdbMovie[]
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) redirect("/auth/login")
  const userId = userRes.user.id

  const now = new Date().toISOString()

  for (const m of movies) {
    const yearStr = m.release_date?.substring(0, 4) ?? ""
    const year = /^\d{4}$/.test(yearStr) ? Number(yearStr) : null
    const genresArray = (m.genre_ids ?? [])
      .map((id) => TMDB_GENRE_MAP[id])
      .filter(Boolean)

    try {
      const { error } = await supabase.rpc("register_movie_data", {
        _title: m.title,
        _year: year,
        _genres: genresArray,
        _status: "watched",
        _rating: 5,
        _memo: null,
        _watched_at: now,
        _created_at: now,
        _poster_path: m.poster_path ?? null,
        _tmdb_id: m.id,
        _tmdb_vote_average: m.vote_average ?? null,
      })
      if (error) {
        revalidatePath("/main")
        revalidatePath("/main/movies")
        return { error: error.message }
      }

      if (genresArray.length > 0) {
        const unlockedGenres = await getUnlockedGenres(userId)
        const isCollectionMovie = genresArray.some((g) => unlockedGenres.has(g))
        await Promise.all([
          awardPoints(userId, isCollectionMovie),
          checkAndUnlockCollections(userId, genresArray),
        ])
      }
    } catch (e) {
      console.error("autoRegister エラー:", e)
      revalidatePath("/main")
      revalidatePath("/main/movies")
      return { error: "登録中にエラーが発生しました" }
    }
  }

  revalidatePath("/main")
  revalidatePath("/main/movies")
  revalidatePath("/main/collection")
  return { success: true }
}

export async function completeTutorial() {
  const cookieStore = await cookies()
  cookieStore.set("tutorial_done", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}
