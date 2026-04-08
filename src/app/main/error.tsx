"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkLoadError =
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk");

    if (!isChunkLoadError) return;

    const reloadKey = `chunk-reload:${window.location.pathname}`;
    if (sessionStorage.getItem(reloadKey)) return;

    sessionStorage.setItem(reloadKey, "1");
    window.location.reload();
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <p className="text-zinc-400 text-sm">ページの読み込みに失敗しました</p>
      <button
        onClick={() => reset()}
        className="text-xs text-amber-600 hover:text-amber-400 underline underline-offset-2 transition-colors"
      >
        再試行する
      </button>
    </div>
  );
}
