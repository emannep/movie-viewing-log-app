"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { updateDisplayName, updateEmail, updatePassword, uploadAvatar } from "@/app/actions/profile";
import { logoutAction } from "@/app/actions/logout";

type Result = { error?: string; success?: boolean; message?: string; url?: string } | null;

function StatusMessage({ result }: { result: Result }) {
  if (!result) return null;
  if (result.error) {
    return <p className="text-red-400 text-sm mt-2">{result.error}</p>;
  }
  return (
    <p className="text-green-400 text-sm mt-2">
      {result.message ?? "更新しました"}
    </p>
  );
}

export default function SettingsClient({
  initialDisplayName,
  initialEmail,
  initialAvatarUrl,
}: {
  initialDisplayName: string;
  initialEmail: string;
  initialAvatarUrl: string | null;
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl);
  const [nameResult, setNameResult] = useState<Result>(null);
  const [emailResult, setEmailResult] = useState<Result>(null);
  const [passwordResult, setPasswordResult] = useState<Result>(null);
  const [avatarResult, setAvatarResult] = useState<Result>(null);

  const [isPendingName, startName] = useTransition();
  const [isPendingEmail, startEmail] = useTransition();
  const [isPendingPassword, startPassword] = useTransition();
  const [isPendingAvatar, startAvatar] = useTransition();
  const [isPendingLogout, startLogout] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  function handleAvatarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setAvatarResult(null);
    startAvatar(async () => {
      const result = await uploadAvatar(formData);
      if (result.success && result.url) {
        setAvatarPreview(result.url);
      }
      setAvatarResult(result);
    });
  }

  function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setNameResult(null);
    startName(async () => {
      const result = await updateDisplayName(formData);
      setNameResult(result);
    });
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setEmailResult(null);
    startEmail(async () => {
      const result = await updateEmail(formData);
      setEmailResult(result);
    });
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPasswordResult(null);
    startPassword(async () => {
      const result = await updatePassword(formData);
      setPasswordResult(result);
      if (result.success) {
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* アイコン */}
      <section className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-5">
        <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-4">アイコン画像</h2>
        <form onSubmit={handleAvatarSubmit}>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="アイコン"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="text-3xl text-zinc-500">👤</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 transition-colors"
              >
                画像を選択
              </button>
              <p className="text-zinc-600 text-xs">JPG / PNG / WebP / GIF · 最大2MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="submit"
            disabled={isPendingAvatar}
            className="w-full py-2 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {isPendingAvatar ? "アップロード中..." : "アイコンを保存"}
          </button>
          <StatusMessage result={avatarResult} />
        </form>
      </section>

      {/* 名前 */}
      <section className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-5">
        <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-4">表示名</h2>
        <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="displayName"
            defaultValue={initialDisplayName}
            placeholder="表示名を入力"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isPendingName}
            className="w-full py-2 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {isPendingName ? "保存中..." : "名前を保存"}
          </button>
          <StatusMessage result={nameResult} />
        </form>
      </section>

      {/* メールアドレス */}
      <section className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-5">
        <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-4">メールアドレス</h2>
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            defaultValue={initialEmail}
            placeholder="メールアドレスを入力"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isPendingEmail}
            className="w-full py-2 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {isPendingEmail ? "更新中..." : "メールアドレスを変更"}
          </button>
          <StatusMessage result={emailResult} />
        </form>
      </section>

      {/* パスワード */}
      <section className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-5">
        <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-4">パスワード</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="新しいパスワード（6文字以上）"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="パスワードを確認"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isPendingPassword}
            className="w-full py-2 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {isPendingPassword ? "更新中..." : "パスワードを変更"}
          </button>
          <StatusMessage result={passwordResult} />
        </form>
      </section>

      {/* ログアウト */}
      <section className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-5">
        <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-4">アカウント</h2>
        <form
          action={() => {
            startLogout(async () => {
              await logoutAction();
            });
          }}
        >
          <button
            type="submit"
            disabled={isPendingLogout}
            className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-red-900/60 border border-zinc-600 hover:border-red-700/60 disabled:opacity-50 text-sm font-medium text-zinc-300 hover:text-red-300 transition-colors"
          >
            {isPendingLogout ? "ログアウト中..." : "ログアウト"}
          </button>
        </form>
      </section>
    </div>
  );
}
