
import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'movie-viewing-log-app',
  description: '映画視聴記録アプリ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
