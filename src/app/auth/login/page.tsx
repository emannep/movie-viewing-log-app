
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            ログイン / サインアップ
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            メールアドレスとパスワードを入力して入場
          </p>
        </div>


        <form
          className="px-8 pb-8 space-y-6"
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              メールアドレス
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              パスワード
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="8文字以上のパスワード"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-4 space-y-2">
            <button
              type="submit"
              name="mode"
              value="login"
              disabled={isLoginSubmitting || isSignupSubmitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoginSubmitting ? "ログイン中..." : "ログイン"}
            </button>
            <p className="flex justify-center text-sm text-slate-300">
              または
            </p>
            <button
              type="submit"
              name="mode"
              value="signup"
              disabled={isLoginSubmitting || isSignupSubmitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSignupSubmitting ? "アカウント作成中..." : "アカウントの新規作成"}
            </button>
          </div>
        </form>
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