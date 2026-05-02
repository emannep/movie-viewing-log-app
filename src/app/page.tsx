import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "記録する",
    desc: "観た映画を評価・感想と一緒にログ",
  },
  {
    icon: Sparkles,
    title: "おすすめ",
    desc: "好みに合わせたAIレコメンド",
  },
  {
    icon: Trophy,
    title: "コレクション",
    desc: "映画を集めてコレクションを完成させる",
  },
];

export default function RootPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">

      <div className="absolute inset-0 z-0">
        <Image
          src="/screenshots/movies.png"
          alt=""
          fill
          className="object-cover object-top scale-110 blur-[3px]"
          priority
        />
        <div className="absolute inset-0 bg-black/72" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6 py-10">
        <div className="flex flex-col items-center">
          <div className="border border-amber-800/60 rounded-sm px-8 py-3 bg-amber-950/30 text-center shadow-inner shadow-amber-950/30 backdrop-blur-sm">
            <p className="text-amber-600/80 text-sm tracking-[0.35em] uppercase mb-0.5">
              Film Museum
            </p>
            <h1 className="text-amber-300 text-3xl font-bold tracking-[0.1em]">
              あなたの映画博物館
            </h1>
          </div>
        </div>

        <p className="text-center text-slate-300 text-base leading-relaxed">
          観た映画を記録して、あなただけの<br />
          映画博物館をつくろう
        </p>

        <div className="grid grid-cols-3 gap-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900/70 border border-amber-900/25 px-2 py-4 backdrop-blur-sm text-center"
            >
              <Icon className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
              <span className="text-amber-300 text-sm font-semibold">{title}</span>
              <span className="text-slate-400 text-xs leading-snug">{desc}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/login">
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-amber-700 hover:bg-amber-600 text-white font-bold tracking-wide shadow-lg transition"
            >
              ログイン
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-12 text-base border-amber-800/60 bg-zinc-900/60 text-amber-300 hover:bg-zinc-800/80 hover:text-amber-200 transition backdrop-blur-sm"
            >
              新規登録
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
