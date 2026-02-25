'use server';

import { createClient } from '@/lib/supabase/server';

async function registerMovie(formData: FormData) {
  const supabase = await createClient();

  try {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) redirect("/login");
    const userId = userRes.user.id;

    const { data, error } = await supabase.rpc("register_movie_data", {
      _title: title,
      _year: year,
      _genres: genres,
      _status: status,
      _rating: rating,
      _memo: memo,
      _watched_at: watched_at,
      _created_at: created_at,
    })
    if (error) {
      console.error("movies 取得エラー:", error);
    } catch (e) {
      console.error("movies クエリ実行エラー:", e);
    }
  }


export default async function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4">
      <h1 className="text-2xl font-bold">映画を登録</h1>


      <form action={registerMovie} className="space-y-4 rounded-md border p-4">
        <div>
          <label className="block text-sm font-medium">タイトル</label>
          <input
            name="title"
            className="mt-1 w-full rounded border px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">映画製作年度</label>
          <input
            name="year"
            className="mt-1 w-full rounded border px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ジャンル</label>
          <input
            name="genres"
            className="mt-1 w-full rounded border px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ステータス</label>
          <select
            name="status"
            className="mt-1 w-full rounded border px-2 py-1"
          >
            <option value="watched">視聴済</option>
            <option value="wishlist">視たい</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">評価（1〜5）</label>
          <input
            type="number"
            name="rating"
            min={1}
            max={5}
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            name="memo"
            className="mt-1 w-full rounded border px-2 py-1"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">視聴日</label>
          <input
            type="date"
            name="watched_at"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ページ作製日</label>
          <input
            type="date"
            name="created_at"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>

        {/* ジャンル選択をやる場合は、genresテーブルから取得して checkbox / select にする */}

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          登録
        </button>
      </form>
    </div>
  )
}