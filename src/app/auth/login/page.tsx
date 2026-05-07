"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/login";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verified = searchParams.get("verified") === "true";

  const [error, setError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  useEffect(() => {
    if (!verified) return;
    const timer = setTimeout(() => {
      router.push("/main");
    }, 2500);
    return () => clearTimeout(timer);
  }, [verified, router]);

  const Header = () => (
    <div className="border border-amber-800/50 rounded-sm px-8 py-3 bg-amber-950/20 text-center">
      <p className="text-amber-700/70 text-base tracking-[0.35em] uppercase mb-1">Film Museum</p>
      <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">あなたの映画博物館</h1>
    </div>
  );

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0907] px-4">
        <div className="w-full max-w-sm flex flex-col gap-6 items-center">
          <Header />
          <div className="rounded-2xl bg-zinc-950/80 border border-amber-700/40 shadow-xl shadow-black/50 px-6 py-10 text-center w-full">
            <p className="text-5xl mb-5">🎬</p>
            <p className="text-2xl text-amber-300 font-bold tracking-wide mb-3">登録完了！</p>
            <p className="text-neutral-300 text-base mb-1">メールアドレスの確認が完了しました</p>
            <p className="text-neutral-500 text-sm">まもなくメインページに移動します...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0907] px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="flex flex-col items-center">
          <Header />
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
