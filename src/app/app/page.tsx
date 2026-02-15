import React from 'react';
import Link from 'next/link';


function MyPage() {
  return (
    <div className="w-full rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
      <div className="px-8 pt-4 pb-6">

        <header className="text-orange-300">
          <h1 className="flex justify-center"
          >
            みたろぐ</h1>
          <link rel="canonical" href="http://" />
        </header>

        <main>
          <Link className="flex justify-center bg-red-900 rounded-2xl"
            href="/app">
              レコメンド、おすすめ
          </Link>
          <div className="grid grid-cols-2">
            <Link className="bg-red-900 rounded-2xl"
              href="/app">
                映画登録
            </Link>
            <Link className="bg-red-900 rounded-2xl"
              href="/app">
                映画一覧
            </Link>
            <Link className="bg-red-900 rounded-2xl"
              href="/app">
                設定
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

export default MyPage;