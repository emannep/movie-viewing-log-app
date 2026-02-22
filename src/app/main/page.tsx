import React from 'react';
import Link from 'next/link';


function MainPage() {
  return (
    <div className="w-full rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
      <div className="px-8 pt-4 pb-6">

        <header className="text-orange-300">
          <h1 className="flex justify-center"
          >
            みたろぐ</h1>
          <link rel="canonical" href="/main" />
        </header>

        <main>
          <Link className="flex justify-center bg-red-900 rounded-2xl"
            href="/main/recommend_movies">
              レコメンド、おすすめ
          </Link>
          <div className="grid grid-cols-2">
            <Link className="bg-red-900 rounded-2xl"
              href="/main/registration">
                映画登録
            </Link>
            <Link className="bg-red-900 rounded-2xl"
              href="/main/movies">
                映画一覧・編集
            </Link>
            <Link className="bg-red-900 rounded-2xl"
              href="/main/settings">
                プロフィール・設定
            </Link>
            <Link className="bg-red-900 rounded-2xl"
              href="/main/movies/test">
                kari
            </Link>
          </div>
        </main>

        <footer>
          <p>Copyright © 2026 My Website</p>
        </footer>

      </div>
    </div>
  );
}

export default MainPage;