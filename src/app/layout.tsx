
import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "movie-viewing-log-app",
  description: "映画視聴記録アプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#0c0907] text-stone-100">
        {children}
      </body>
    </html>
  );
}
