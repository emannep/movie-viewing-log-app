"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, LayoutList, Landmark, User } from "lucide-react";

const NAV = [
  { href: "/main", icon: Home, label: "ホーム" },
  { href: "/main/registration", icon: Plus, label: "登録" },
  { href: "/main/movies", icon: LayoutList, label: "一覧" },
  { href: "/main/collection", icon: Landmark, label: "展示室" },
  { href: "/main/profile", icon: User, label: "プロフィール" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0907]/95 border-t border-amber-900/40 backdrop-blur-sm">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1 pb-[env(safe-area-inset-bottom,4px)]">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/main"
              ? pathname === "/main"
              : pathname.startsWith(href);
          const itemClass = `flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors ${
            active ? "text-amber-400" : "text-zinc-100 hover:text-zinc-300"
          }`;
          const inner = (
            <>
              <Icon size={22} strokeWidth={active ? 2.2 : 1.5} />
              <span className={`text-sm font-medium tracking-wide ${active ? "text-amber-400" : "text-zinc-100"}`}>
                {label}
              </span>
            </>
          );

          // ホーム・展示室は router.refresh() を挟んで Router Cache をバイパス
          if (href === "/main" || href === "/main/collection") {
            return (
              <button
                key={href}
                className={itemClass}
                onClick={() => {
                  router.push(href);
                  router.refresh();
                }}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link key={href} href={href} className={itemClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
