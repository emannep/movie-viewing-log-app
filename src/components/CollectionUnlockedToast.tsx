"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Landmark, X } from "lucide-react";

export default function CollectionUnlockedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const raw = searchParams.get("unlocked");
    if (!raw) return;

    const decoded = decodeURIComponent(raw)
      .split(",")
      .map((s) => {
        const [genre, decade] = s.split("-");
        return `${decade}年代 ${genre}`;
      });
    setItems(decoded);

    // URLからパラメータを消す（履歴を汚さない）
    const params = new URLSearchParams(searchParams.toString());
    params.delete("unlocked");
    const newUrl = params.toString() ? `?${params}` : window.location.pathname;
    router.replace(newUrl);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-2 duration-300">
      <div className="bg-amber-950/95 border border-amber-700/60 rounded-xl p-4 shadow-xl shadow-black/50 backdrop-blur-sm">
        <button
          className="absolute top-3 right-3 text-amber-700 hover:text-amber-400 transition-colors"
          onClick={() => setItems([])}
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-amber-800/60 p-2 shrink-0">
            <Landmark size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-amber-300 font-semibold text-sm">
              展示室が解放されました！
            </p>
            {items.map((label) => (
              <p key={label} className="text-amber-500/80 text-xs mt-0.5">
                {label} コレクション
              </p>
            ))}
            <button
              className="mt-2 text-xs text-amber-600 hover:text-amber-400 underline underline-offset-2 transition-colors"
              onClick={() => {
                setItems([]);
                router.push("/main/collection");
                router.refresh();
              }}
            >
              展示室を見る →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
