// app/(app)/movies/test/page.tsx
'use server';

import { createClient } from '@/lib/supabase/server'; // いつも使ってるやつ想定

export async function registerMovie(formData: FormData) {
  const title = formData.get('title') as string | null;
  const year = formData.get('year') as string | null;

  if (!title) {
    return { ok: false, error: 'title が必要です' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('movies')
    .insert({
      title,
      year: year ? Number(year) : null,
    });

  if (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export default async function Page() {
  const supabase = await createClient();
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="p-4 space-y-4">
      <form action={registerMovie} className="space-y-2 border p-3 rounded">
        <div>
          <label className="block text-sm font-medium">タイトル</label>
          <input
            name="title"
            className="border px-2 py-1 w-full"
            placeholder="映画タイトル"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">年</label>
          <input
            name="year"
            type="number"
            className="border px-2 py-1 w-full"
            placeholder="2024"
          />
        </div>
        <button
          type="submit"
          className="mt-2 px-3 py-1 border rounded bg-blue-600 text-white"
        >
          登録
        </button>
      </form>

      {error && <p className="text-red-500">取得エラー: {error.message}</p>}

      <section>
        <h2 className="font-semibold mb-2">movies 一覧</h2>
        <ul className="space-y-1">
          {movies?.map((m) => (
            <li key={m.id}>
              {m.title} {m.year && `(${m.year})`}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
