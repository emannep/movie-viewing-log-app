import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/login");

  const displayName = (user.user_metadata?.display_name as string) ?? "";
  const avatarUrl = (user.user_metadata?.avatar_url as string) ?? null;

  return (
    <div className="w-full flex flex-col gap-5">
      <header className="flex items-center justify-between pt-1">
        <Link
          href="/main/profile"
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          ← プロフィール
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-amber-900/50" />
          <h1 className="text-amber-600/90 text-[10px] tracking-[0.3em] uppercase">設定</h1>
          <div className="h-px w-6 bg-amber-900/50" />
        </div>
        <div className="w-20" />
      </header>
      <div className="flex flex-col gap-4">

        <SettingsClient
          initialDisplayName={displayName}
          initialEmail={user.email ?? ""}
          initialAvatarUrl={avatarUrl}
        />
      </div>
    </div>
  );
}
