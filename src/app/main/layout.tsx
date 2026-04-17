import React, { type ReactNode } from 'react';
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-113px)] max-w-lg mx-auto p-4">
      {children}
      <BottomNav />
    </div>
  );
}

export const metadata = {
  title: 'あなたの映画博物館 | 観た映画の評価や感想を記録・レコメンドしておすすめを表示',
  description: '観た映画の評価や感想を記録し、レコメンドしておすすめを表示できる映画評価アプリ。',
  keywords: ['映画', '鑑賞ログ', '映画記録', '評価', 'レビュー', 'レコメンド', 'おすすめ表示'],
  authors: [{ name: 'emannep' }],
  robots: 'index, follow',
};
