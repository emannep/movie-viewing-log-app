
import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "movie-viewing-log-app",
  description: "映画視聴記録アプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" style={{ backgroundColor: '#0c0907' }}>
      <body className="min-h-screen bg-[#0c0907] text-stone-100">
        {children}
        <footer className="flex pt-2 pb-[70px] mx-4 items-center justify-center gap-4 text-xs text-stone-400 border-t border-slate-800/50">
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
            <img src="/tmdb_logo.svg" alt="TMDB" width={80} />
          </a>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </footer>
      </body>
    </html>
  );
}
