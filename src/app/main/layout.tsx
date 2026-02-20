import React, { type ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const metadata = {
    title: '映画評価アプリ | 観た映画の評価や感想を記録・レコメンドしておすすめを表示',//アプリ名設定
    description: '観た映画の評価や感想を記録し、レコメンドしておすすめを表示できる映画評価アプリ。',
    keywords: ['映画', '鑑賞ログ', '映画記録', '評価', 'レビュー', 'レコメンド', 'おすすめ表示'],
    authors: [{ name: 'emannep'}],
    robots: 'index, follow',
  };