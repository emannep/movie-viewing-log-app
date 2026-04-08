
 "use client";

/*
  Error: Server Actions cannot be called during initial renderが出るなら
  startTransition()で呼び出す
*/
import { useState } from "react";
import { authAction } from "@/app/actions/login";

export default function loginPage() {
  const [error, setError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0907] px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* 館名プレート */}
        <div className="flex flex-col items-center">
          <div className="border border-amber-800/50 rounded-sm px-8 py-3 bg-amber-950/20 text-center">
            <p className="text-amber-700/70 text-[10px] tracking-[0.35em] uppercase mb-1">Film Museum</p>
            <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">あなたの映画博物館</h1>
          </div>
          <p className="mt-3 text-xs text-zinc-600 tracking-widest uppercase">入館手続き</p>
        </div>

        <div className="rounded-2xl bg-zinc-950/80 border border-amber-900/30 shadow-xl shadow-black/50">
        <div className="px-6 pt-6 pb-2">
          <p className="text-sm text-zinc-400">
            メールアドレスとパスワードを入力してください
          </p>
        </div>

        <form
          className="px-6 pb-6 space-y-4 pt-2"
          action={async (formData) => {
            const mode = (formData.get("mode") as string | null) ?? "login";
            setError("");

            if (mode === "signup") {
              setIsSignupSubmitting(true);
              setIsLoginSubmitting(false);
            } else {
              setIsLoginSubmitting(true);
              setIsSignupSubmitting(false);
            }

            const result = await authAction(formData);
            if (result?.error) {
              setError(result.error);
              setIsLoginSubmitting(false);
              setIsSignupSubmitting(false);
            }
            // 成功時は redirect で遷移するのでここには戻ってこない
          }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-amber-700/80 tracking-widest uppercase">
              メールアドレス
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg bg-zinc-900 border border-amber-900/30 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-700/60 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-amber-700/80 tracking-widest uppercase">
              パスワード
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg bg-zinc-900 border border-amber-900/30 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-700/60 transition-colors"
              placeholder="パスワード"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              name="mode"
              value="login"
              disabled={isLoginSubmitting || isSignupSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-100 font-semibold text-sm tracking-wide transition-colors"
            >
              {isLoginSubmitting ? "入館中..." : "入館する"}
            </button>
            <p className="text-center text-xs text-zinc-600">または</p>
            <button
              type="submit"
              name="mode"
              value="signup"
              disabled={isLoginSubmitting || isSignupSubmitting}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-amber-900/30 text-zinc-300 font-medium text-sm transition-colors"
            >
              {isSignupSubmitting ? "作成中..." : "新規アカウント作成"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
/*
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsLoginSubmitting(true);
    setError("");
    
    const result = await loginAction(email, password);

    if (result?.error) {
      setError(result.error);
      setIsLoginSubmitting(false);
    }
  };

  const handleSignup = async () => {
    setIsSignupSubmitting(true);
    setError("");

    const result = await signupAction(email, password);

    if (result?.error) {
      setError(result.error);
      setIsSignupSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            ログイン
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            メールアドレスとパスワードを入力して入場
          </p>
        </div>

        <form className="px-8 pb-8 space-y-6">
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
              type="button"
              disabled={isLoginSubmitting}
              onClick={handleLogin}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoginSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
            <p className="flex justify-center text-sm text-slate-300">
              または
            </p>
            <button
              type="button"
              disabled={isSignupSubmitting}
              onClick={handleSignup}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSignupSubmitting ? 'アカウント作成中...' : 'アカウントの新規作成'}
            </button>
          </div>

      </div>
    </div>
  );
}
*/