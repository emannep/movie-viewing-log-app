import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const genreId = searchParams.get("genre_id")

  if (!genreId) {
    return NextResponse.json({ error: "genre_id が必要です" }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API Keyが設定されていません" }, { status: 500 })
  }

  try {
    // 人気映画を多めに取得してランダム性を出すため2ページ分取得
    const pages = [1, 2]
    const responses = await Promise.all(
      pages.map((page) => {
        const url = new URL("https://api.themoviedb.org/3/discover/movie")
        url.searchParams.set("api_key", apiKey)
        url.searchParams.set("language", "ja-JP")
        url.searchParams.set("sort_by", "popularity.desc")
        url.searchParams.set("with_genres", genreId)
        url.searchParams.set("page", String(page))
        return fetch(url.toString())
      })
    )

    const allResults: any[] = []
    for (const res of responses) {
      if (res.ok) {
        const data = await res.json()
        allResults.push(...(data.results ?? []))
      }
    }

    // poster_path がある映画のみ対象にシャッフルして返す
    const withPoster = allResults.filter((m) => m.poster_path)
    for (let i = withPoster.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[withPoster[i], withPoster[j]] = [withPoster[j], withPoster[i]]
    }

    return NextResponse.json({ results: withPoster.slice(0, 3) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
