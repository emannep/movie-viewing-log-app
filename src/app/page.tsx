import Link from 'next/link';

/**
 * アプリ起動時に最初に表示される認証用の画面。
 * ここからログイン画面（/auth/login）へ遷移する。
 */
export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
        <div className="px-8 pt-8 pb-6">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            Movie Viewing Log
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white tracking-tight">
            「みたろぐ」へようこそ
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            観た映画の評価や感想を記録し、あなた好みの作品をレコメンドするためのアプリです。
            まずはログインして、あなた専用の映画ログをはじめましょう。
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-4">
          {/* 仮のボタン：ログイン画面へ遷移 */}
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            ログイン画面へ進む
          </Link>

          <p className="text-xs text-slate-400">
            ※ 現在は認証導線の確認用として、ログイン画面へ移動する仮のボタンのみを配置しています。
          </p>
        </div>
      </div>
    </div>
  );
}
