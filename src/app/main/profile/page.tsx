import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileData } from "@/app/actions/points";
import { CROWN_LABELS, CROWN_COLORS } from "@/lib/points-utils";
import Link from "next/link";

function CrownBadge({
  rank,
  label,
  color,
  count,
  nextThreshold,
  type,
}: {
  rank: string;
  label: string;
  color: string;
  count: number;
  nextThreshold: number | null;
  type: "season" | "annual";
}) {
  const typeLabel = type === "season" ? "シーズン" : "年間";

  return (
    <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-4 flex flex-col gap-2">
      <p className="text-zinc-500 text-xs">{typeLabel}王冠</p>
      {rank !== "none" ? (
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${color}`}>👑</span>
          <span className={`font-bold text-lg ${color}`}>{label}</span>
        </div>
      ) : (
        <p className="text-zinc-600 text-sm">まだ獲得していません</p>
      )}
      <p className="text-zinc-500 text-xs">
        今期 {count} 本
        {nextThreshold && (
          <span className="text-amber-600 ml-1">
            （次: {nextThreshold} 本〜）
          </span>
        )}
      </p>
    </div>
  );
}

function SeasonCard({
  seasonLabel,
  points,
  level,
  title,
  isCurrent,
}: {
  seasonLabel: string;
  points: number;
  level: number;
  title: string;
  isCurrent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        isCurrent
          ? "bg-amber-950/30 border-amber-700/40"
          : "bg-zinc-900/40 border-zinc-700/30"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-400">{seasonLabel}</span>
        {isCurrent && (
          <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full">
            今期
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-amber-300 font-bold text-lg">Lv {level}</span>
        <span className="text-zinc-400 text-sm mb-0.5">{title}</span>
      </div>
      <p className="text-zinc-600 text-xs mt-1">{points} pt</p>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const profile = await getProfileData();
  if (!profile) redirect("/auth/login");

  const { currentSeason, seasonHistory, seasonalCrown, annualCrown } = profile;

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
            <h1 className="text-orange-300 text-xl font-semibold">プロフィール</h1>
          </div>
        </header>

        {/* 現在のシーズンレベル */}
        <section className="mb-6">
          <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-3">
            現在のシーズン
          </h2>
          <SeasonCard
            seasonLabel={currentSeason.seasonLabel}
            points={currentSeason.points}
            level={currentSeason.level}
            title={currentSeason.title}
            isCurrent
          />
          <p className="text-zinc-600 text-xs mt-2 text-center">
            5ポイントごとにレベルアップ（コレクション映画: 2pt / その他: 1pt）
          </p>
        </section>

        {/* 王冠 */}
        <section className="mb-6">
          <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-3">
            王冠
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <CrownBadge {...seasonalCrown} type="season" />
            <CrownBadge {...annualCrown} type="annual" />
          </div>
        </section>

        {/* シーズン履歴 */}
        {seasonHistory.length > 0 && (
          <section>
            <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-3">
              シーズン記録
            </h2>
            <div className="flex flex-col gap-2">
              {seasonHistory.map((s) => (
                <SeasonCard
                  key={s.seasonKey}
                  seasonLabel={s.seasonLabel}
                  points={s.points}
                  level={s.level}
                  title={s.title}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
