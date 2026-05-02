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
      <header className="relative flex items-center justify-between pt-1">
        <Link
          href="/main/profile"
          className="flex items-center gap-1 text-neutral-300 hover:text-zinc-300 transition-colors text-base"
        >
          ← プロフィール
        </Link>
        <div className="absolute inset-x-0 flex items-center justify-center gap-3 pointer-events-none">
          <div className="h-px w-16 bg-amber-300/50" />
          <h1 className="text-amber-300 text-base tracking-[0.3em] uppercase">設定</h1>
          <div className="h-px w-16 bg-amber-300/50" />
        </div>
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
