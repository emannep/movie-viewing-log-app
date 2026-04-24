
 "use client";

/*
  Error: Server Actions cannot be called during initial renderが出るなら
  startTransition()で呼び出す
*/
import { useState } from "react";
import { signupAction } from "@/app/actions/signup";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0907] px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* 館名プレート */}
        <div className="flex flex-col items-center">
          <div className="border border-amber-800/50 rounded-sm px-8 py-3 bg-amber-950/20 text-center">
            <p className="text-amber-700/70 text-base tracking-[0.35em] uppercase mb-1">Film Museum</p>
            <h1 className="text-amber-300 text-2xl font-bold tracking-[0.15em]">あなたの映画博物館</h1>
          </div>
          <p className="mt-3 text-xl text-neutral-300 tracking-widest uppercase">新規発行</p>
        </div>

        <div className="rounded-2xl bg-zinc-950/80 border border-amber-900/30 shadow-xl shadow-black/50">
        <div className="px-6 pt-6 pb-2">
          <p className="text-base text-neutral-300">
            登録したいメールアドレスと、<br />
            パスワードを入力してください<br />
            入力したメールアドレスに確認メールを送ります<br />
            パスワードは8文字以上で入力してください
          </p>
        </div>

        {pendingEmail && (
          <div className="rounded-xl border border-amber-700/40 bg-amber-950/30 px-5 py-4 text-base text-amber-300 text-center">
            <p className="text-lg mb-1">📧 確認メールを送信しました</p>
            <p className="text-amber-500 text-base">{pendingEmail} に届いたメールのリンクをクリックして登録を完了してください</p>
          </div>
        )}

        <form
          className="px-6 pb-6 space-y-4 pt-2"
          action={async (formData) => {
            setError("");
            setIsSignupSubmitting(true);

            const result = await signupAction(formData);
            if (result?.error) {
              setError(result.error);
              setIsSignupSubmitting(false);
            } else if (result?.pendingEmail) {
              setPendingEmail(result.pendingEmail);
            }
          }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-base text-amber-700/80 tracking-widest uppercase">
              登録するメールアドレス
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
              パスワード（8文字以上）
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
              value="signup"
              disabled={isSignupSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-100 font-semibold text-lg tracking-wide transition-colors"
            >
              {isSignupSubmitting ? "作成中..." : "アカウント作成"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
