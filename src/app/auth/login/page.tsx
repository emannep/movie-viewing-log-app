
 "use client";

/*
  Error: Server Actions cannot be called during initial renderが出るなら
  startTransition()で呼び出す
*/
import { useState } from "react";
import { loginAction } from "@/app/actions/login";
import Link from "next/link";

export default function loginPage() {
  const [error, setError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0907] px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* 館名プレート */}
        <div className="flex flex-col items-center">
          <div className="border border-amber-800/50 rounded-sm px-8 py-3 bg-amber-950/20 text-center">
            <p className="text-amber-700/70 text-base tracking-[0.35em] uppercase mb-1">Film Museum</p>
            <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">あなたの映画博物館</h1>
          </div>
          <p className="mt-3 text-xl text-neutral-300 tracking-widest uppercase">入館手続き</p>
        </div>

        <div className="rounded-2xl bg-zinc-950/80 border border-amber-900/30 shadow-xl shadow-black/50">
        <div className="px-6 pt-6 pb-2">
          <p className="text-lg text-neutral-300">
            メールアドレスとパスワードを入力してください
          </p>
        </div>

        <form
          className="px-6 pb-6 space-y-4 pt-2"
          action={async (formData) => { 
            setError("");
            setIsLoginSubmitting(true);

            const result = await loginAction(formData);
            if (result?.error) {
              setError(result.error);
              setIsLoginSubmitting(false);
            }
          }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-base text-amber-700/80 tracking-widest uppercase">
              メールアドレス
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg bg-zinc-900 border border-amber-900/30 px-3 py-2 text-base text-zinc-100 placeholder-neutral-300 focus:outline-none focus:border-amber-700/60 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base text-amber-700/80 tracking-widest uppercase">
              パスワード
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg bg-zinc-900 border border-amber-900/30 px-3 py-2 text-base text-zinc-100 placeholder-neutral-300 focus:outline-none focus:border-amber-700/60 transition-colors"
              placeholder="パスワード"
            />
          </div>

          {error && (
            <p className="text-base text-red-400">{error}</p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              name="mode"
              value="login"
              disabled={isLoginSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-100 font-semibold text-lg tracking-wide transition-colors"
            >
              {isLoginSubmitting ? "ログイン中..." : "ログインする"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
