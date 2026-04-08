"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";


export default function RootPage() {
  return (
    <div className="">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
        <div className="px-8 pt-8 pb-6">
          <p className="text-xs font-semibold tracking-widest text-orange-300 uppercase">
            Movies Viewing Log
          </p>
          <h1 className="flex justify-center items-center text-center mt-2 text-2xl font-semibold text-orange-300 tracking-tight">
            「あなたの映画博物館」へようこそ
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            観た映画の評価や感想を記録し、あなた好みの作品をレコメンドするためのアプリです。
            まずはログインして、あなた専用の映画ログをはじめましょう。
          </p>
        </div>

        
        <div className="px-8 pb-8 flex flex-col gap-4">
          <Link
            className="flex justify-center"
            href="/auth/login"
          >
            <Button size="lg"
              className="bg-red-900 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              ログイン画面へ進む
            </Button>
          </Link>
          <Link 
            className="bg-red-900 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            href="/main"
          >
            仮設ボタンメインページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
