import React, { type ReactNode } from 'react';
import BottomNav from "@/components/BottomNav";
import Image from 'next/image'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-h-[calc(100vh-113px)] max-w-lg mx-auto p-4">
        {children}
        <BottomNav />
      </div>
      <footer className="flex pt-2 pb-[70px] mx-4 items-center justify-center gap-4 text-xs text-stone-400 border-t border-slate-800/50">
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
          <img src="/tmdb_logo.svg" alt="TMDB" width={80} />
        </a>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </>
  );
}

export const metadata = {
  title: 'あなたの映画博物館 | 観た映画の評価や感想を記録・レコメンドしておすすめを表示',
  description: '観た映画の評価や感想を記録し、レコメンドしておすすめを表示できる映画評価アプリ。',
  keywords: ['映画', '鑑賞ログ', '映画記録', '評価', 'レビュー', 'レコメンド', 'おすすめ表示'],
  authors: [{ name: 'emannep' }],
  robots: 'index, follow',
};
