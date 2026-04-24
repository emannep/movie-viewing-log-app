import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileData } from "@/app/actions/points";
import { CROWN_LABELS, CROWN_COLORS, CROWN_ICON_COLORS } from "@/lib/points-utils";
import Link from "next/link";
import Image from "next/image";
import { Crown } from "lucide-react";

function CrownBadge({
  rank,
  label,
  color,
  count,
  nextThreshold,
  percentile,
  type,
}: {
  rank: string;
  label: string;
  color: string;
  count: number;
  nextThreshold: number | null;
  percentile: number | null;
  type: "season" | "annual";
}) {
  const typeLabel = type === "season" ? "シーズン" : "年間";
  const crownColors = CROWN_ICON_COLORS[rank as keyof typeof CROWN_ICON_COLORS];
  // percentile=0（比較対象なし or 最下位）のときは非表示
  const topPercent =
    percentile !== null && percentile > 0
      ? Math.round((1 - percentile) * 100)
      : null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-4 flex flex-col gap-2">
      <p className="text-amber-300 text-base">{typeLabel}王冠</p>
      {rank !== "none" ? (
        <div className="flex items-center gap-2">
          <Crown
            size={24}
            fill={crownColors.fill}
            stroke={crownColors.stroke}
            strokeWidth={1.5}
          />
          <span className={`font-bold text-lg ${color}`}>{label}</span>
          {topPercent !== null && (
            <span className="text-neutral-300 text-sm ml-1">上位 {topPercent}%</span>
          )}
        </div>
      ) : (
        <p className="text-neutral-300 text-base">まだ獲得していません</p>
      )}
      <p className="text-neutral-300 text-sm">
        {type === "season" ? "今期" : "今年"} {count} 本
        {nextThreshold && (
          <span className="text-neutral-300 ml-1">
            （次: {nextThreshold} 本〜）
          </span>
        )}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const profile = await getProfileData();
  if (!profile) redirect("/auth/login");

  const { totalPoints, level, title, seasonalCrown, annualCrown } = profile;
  const user = userRes.user;
  const displayName = (user.user_metadata?.display_name as string) || null;
  const avatarUrl = (user.user_metadata?.avatar_url as string) || null;

  return (
    <div className="w-full flex flex-col gap-0">
      <div className="px-0 pt-0 pb-8">

        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="w-16" />
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-amber-900/50" />
              <h1 className="text-amber-600/90 text-base tracking-[0.3em] uppercase">プロフィール</h1>
              <div className="h-px w-6 bg-amber-900/50" />
            </div>
            <Link
              href="/main/settings"
              className="text-neutral-300 text-sm hover:text-zinc-300 transition-colors w-16 text-right"
            >
              設定 →
            </Link>
          </div>
        </header>

        {/* ユーザー情報 */}
        <section className="mb-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="アイコン"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <span className="text-3xl text-neutral-300">👤</span>
            )}
          </div>
          <div className="text-center">
            {displayName && (
              <p className="text-zinc-100 font-semibold text-lg">{displayName}</p>
            )}
          </div>
        </section>

        {/* レベル・称号 */}
        <section className="mb-6">
          <h2 className="text-amber-600/90 text-base tracking-[0.3em] uppercase mb-3">
            レベル
          </h2>
          <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-5">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-amber-300 font-bold text-3xl">Lv {level}</span>
                <span className="text-zinc-300 text-base ml-3">{title}</span>
              </div>
              <span className="text-neutral-300 text-base">{totalPoints} pt</span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((totalPoints % 10) / 10 * 100, 100)}%` }}
                />
              </div>
              <p className="text-neutral-300 text-sm mt-1.5">
                次のレベルまで {10 - (totalPoints % 10)} pt
                <span className="ml-2">（コレクション映画: 2pt / その他: 1pt）</span>
              </p>
            </div>
          </div>
        </section>

        {/* 王冠 */}
        <section>
          <h2 className="text-amber-600/90 text-base tracking-[0.3em] uppercase mb-3">
            王冠
          </h2>
          <div className="flex flex-col gap-3">
            <CrownBadge {...seasonalCrown} type="season" />
            <CrownBadge {...annualCrown} type="annual" />
          </div>
        </section>

      </div>
    </div>
  );
}
