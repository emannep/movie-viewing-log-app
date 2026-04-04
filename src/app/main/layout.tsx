import React, { type ReactNode } from 'react';
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-4 pb-24">
      {children}
      <BottomNav />
    </div>
  );
}

export const metadata = {
  title: 'みたろぐ | 観た映画の評価や感想を記録・レコメンドしておすすめを表示',
  description: '観た映画の評価や感想を記録し、レコメンドしておすすめを表示できる映画評価アプリ。',
  keywords: ['映画', '鑑賞ログ', '映画記録', '評価', 'レビュー', 'レコメンド', 'おすすめ表示'],
  authors: [{ name: 'emannep' }],
  robots: 'index, follow',
};
