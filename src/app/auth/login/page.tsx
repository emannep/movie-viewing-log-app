'use client';

import React, { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  //const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async () => {
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({ 
      email,
      password
    });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
    router.push('/app');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    // サーバー側のセッションを最新にする
    router.refresh();
    router.push('/app');
  };

  return (
    <div>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            ログイン
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            メールアドレスとパスワードを入力して入場
          </p>
        </div>

        <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="8文字以上のパスワード"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}
        </form>


          <div className="mt-4 space-y-2 px-8 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
            <p className="flex justify-center text-sm text-slate-300">
              または
            </p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={signUp}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'アカウント作成中...' : 'アカウントの新規作成'}
            </button>
          </div>

      </div>
    </div>
    </div>
  );
}
