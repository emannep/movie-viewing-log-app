import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserCollections } from "@/app/actions/collections";
import { getProfileData } from "@/app/actions/points";
import { CROWN_ICON_COLORS } from "@/lib/points-utils";
import CollectionGallery from "./CollectionGallery";
import { Crown } from "lucide-react";

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const [collections, profile] = await Promise.all([
    getUserCollections(),
    getProfileData(),
  ]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* ヘッダー */}
      <header className="flex flex-col items-center gap-1 pt-1">
        <div className="flex items-center gap-3 w-full">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-900/50" />
          <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">展示室</h1>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-900/50" />
        </div>
        <p className="text-zinc-600 text-xs">
          {collections.length > 0
            ? `${collections.length} 件の展示コレクション`
            : "映画を登録してコレクションを解放しよう"}
        </p>
      </header>

      {/* 称号・王冠 */}
      {profile && (
        <section className="bg-zinc-900/60 border border-amber-900/20 rounded-xl p-4 flex flex-col gap-3">
          {/* 称号 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-700/70 text-[10px] tracking-widest uppercase">称号</span>
              <span className="text-zinc-200 text-sm font-semibold">{profile.title}</span>
            </div>
            <span className="text-amber-400 text-xs font-bold">Lv {profile.level}</span>
          </div>

          {/* 王冠 */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { info: profile.seasonalCrown, typeLabel: "シーズン王冠" },
              { info: profile.annualCrown,   typeLabel: "年間王冠" },
            ].map(({ info, typeLabel }) => {
              const colors = CROWN_ICON_COLORS[info.rank as keyof typeof CROWN_ICON_COLORS];
              return (
                <div key={typeLabel} className="bg-zinc-950/60 border border-zinc-700/30 rounded-lg p-3 flex flex-col gap-1">
                  <p className="text-zinc-500 text-[10px] tracking-widest uppercase">{typeLabel}</p>
                  {info.rank !== "none" ? (
                    <div className="flex items-center gap-1.5">
                      <Crown size={16} fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5} />
                      <span className={`text-sm font-bold ${info.color}`}>{info.label}</span>
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-xs">未獲得</p>
                  )}
                  <p className="text-zinc-500 text-[10px]">
                    {info.count} 本
                    {info.nextThreshold && (
                      <span className="text-amber-700 ml-1">/ 次: {info.nextThreshold} 本〜</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ギャラリー */}
      <CollectionGallery collections={collections} />
    </div>
  );
}
