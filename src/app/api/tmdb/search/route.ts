import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');

  if (!title) {
    return NextResponse.json({ error: 'タイトルが必要です' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is not defined in environment variables");
    return NextResponse.json({ error: 'TMDB API Keyが設定されていません' }, { status: 500 });
  }

  try {
    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('query', title);
    if (year) {
      url.searchParams.append('year', year);
    }
    url.searchParams.append('language', 'ja-JP');

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.status_message || 'TMDB APIエラー' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('TMDB API fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
