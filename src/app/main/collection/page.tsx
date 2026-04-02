import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserCollections } from "@/app/actions/collections";
import CollectionGallery from "./CollectionGallery";
import Link from "next/link";

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const collections = await getUserCollections();

  return (
    <div className="w-full rounded-2xl bg-zinc-950/80 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur">
      <div className="px-6 pt-4 pb-8">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <Link
              href="/main"
              className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
            >
              ← ホーム
            </Link>
          </div>
          <div className="mt-4 text-center">
            <h1 className="text-amber-300 text-xl font-semibold tracking-wide">
              🏛️ コレクション
            </h1>
            <p className="text-zinc-500 text-xs mt-1">
              {collections.length > 0
                ? `${collections.length} 件の展示コレクション`
                : "映画を登録してコレクションを解放しよう"}
            </p>
          </div>
        </header>

        {/* ギャラリー */}
        <CollectionGallery collections={collections} />
      </div>
    </div>
  );
}
