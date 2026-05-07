"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const SLIDES = [
  {
    page: "ホーム",
    imagePath: "/screenshots/tutorial-main.png",
    imageAlt: "ホームページ",
    imageSize: { width: 420, height: 900 },
    points: [
      { num: "①", top: "17%", label: "あなたのコレクション", desc: "あなたのコレクションが\nここに表示されます。\n表示するコレクションは\n展示室ページで選択できます。" },
      { num: "②", top: "61%", label: "おすすめ映画と観たいリスト", desc: "あなたの登録した映画を元に\nあなたにおすすめの映画が\n表示されます。\n登録時に「観たい」を\n選択した映画の一覧も表示されます。" },
      { num: "③", top: "95%", label: "ナビゲーションバー", desc: "下のバーで\n各ページに移動できます。" },
    ],
  },
  {
    page: "登録",
    imagePath: "/screenshots/tutorial-registration.png",
    imageAlt: "登録ページ",
    imageSize: { width: 420, height: 1190 },
    points: [
      { num: "①", top: "10%", label: "タイトル入力・検索", desc: "タイトルを入力出来ます。\nTMDB検索を押すと\nタイトルを元に類似名の映画が\n表示されて、選択した映画情報と\n映画ポスターが\n自動選択されます。" },
      { num: "②", top: "19%", label: "映画詳細", desc: "ジャンル・年代を入力できます。\n映画検索しても\n映画が出てこない場合、\n手動で入力出来ます。" },
      { num: "③", top: "51%", label: "ステータス", desc: "映画の感想など\n各種記録を入力できます。\n「視聴済」を選択すると、\n評価と視聴日の項目が\n追加で表示されます。" },
    ],
  },
  {
    page: "映画一覧",
    imagePath: "/screenshots/tutorial-movies.png",
    imageAlt: "映画一覧ページ",
    imageSize: { width: 420, height: 900 },
    points: [
      { num: "①", top: "6%", label: "フィルター", desc: "各種登録情報順で並び替えたり、\n条件を選択して\n絞り込んで表示出来ます。" },
      { num: "②", top: "40%", label: "映画一覧", desc: "あなたの登録した映画が\n表示されます。" },
      { num: "③", top: "88%", label: "詳細・編集", desc: "映画を選択すると\nここに詳細情報が表示されます。\nまた編集・削除を選択すると、\n登録情報の変更や\n映画の削除も出来ます。" },
    ],
  },
  {
    page: "展示室",
    imagePath: "/screenshots/tutorial-collection.png",
    imageAlt: "コレクションページ",
    imageSize: { width: 420, height: 900 },
    points: [
      { num: "①", top: "3%", label: "コンプリート一覧と\nコレクション選択", desc: "コンプリートしたコレクションの\n一覧は左の🏆マークで、\nこのページに表示する\nコレクションは、右の選択で\n5件まで選択して表示できます。" },
      { num: "②", top: "9%", label: "ホームに表示ボタン", desc: "表示中にすると\nメインページに表示されます。\n2件まで選択できます。" },
      { num: "③", top: "25%", label: "コレクション", desc: "コレクションの達成率、\n映画ポスター、映画タイトルが\n表示されます。\n登録した映画のポスターは\nカラーで表示されます。\n映画を選択すると\nTMDBリンクが表示されて、\n映画の詳細を確認できます。" },
    ],
  },
  {
    page: "プロフィール",
    imagePath: "/screenshots/tutorial-profile.png",
    imageAlt: "プロフィールページ",
    imageSize: { width: 420, height: 900 },
    points: [
      { num: "①", top: "9%", label: "プロフィールと設定", desc: "あなたのプロフィール画像と\n名前を確認出来ます。\n右上の設定から\nプロフィール画像、名前、\nメールアドレス、パスワードを\n変更できます。\nチュートリアルの確認と\nログアウトも設定にあります。" },
      { num: "②", top: "23%", label: "レベル", desc: "映画を登録するたびに\nレベルアップします。\n一定数レベルアップするごとに\n称号も変化して行きます。" },
      { num: "③", top: "43%", label: "王冠", desc: "3ヶ月のシーズンごとと\n年間の映画視聴数を、\nユーザー全体で統計を取り、\nランキングに合わせて\n王冠を獲得出来ます。" },
    ],
  },
] as const

function SlideImage({
  src,
  alt,
  width,
  height,
}: {
  src: string
  alt: string
  width: number
  height: number
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className="h-full rounded-xl border border-amber-900/30 bg-zinc-900/80 flex items-center justify-center"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-neutral-600 text-xs text-center">スクリーンショット準備中</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="h-full w-auto block rounded-xl border border-amber-900/30 shadow-lg"
      onError={() => setHasError(true)}
    />
  )
}

type Props = {
  onComplete: () => void
}

export default function PageGuideSlideshowPopup({ onComplete }: Props) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [pointIndex, setPointIndex] = useState(0)

  const slide = SLIDES[slideIndex]
  const activePoint = slide.points[pointIndex]
  const isFirst = slideIndex === 0 && pointIndex === 0
  const isLastPoint = pointIndex === slide.points.length - 1
  const isLastSlide = slideIndex === SLIDES.length - 1
  const isLast = isLastSlide && isLastPoint

  function handleNext() {
    if (!isLastPoint) {
      setPointIndex((p) => p + 1)
    } else if (!isLastSlide) {
      setSlideIndex((s) => s + 1)
      setPointIndex(0)
    } else {
      onComplete()
    }
  }

  function handlePrev() {
    if (pointIndex > 0) {
      setPointIndex((p) => p - 1)
    } else if (slideIndex > 0) {
      const prevSlide = SLIDES[slideIndex - 1]
      setSlideIndex((s) => s - 1)
      setPointIndex(prevSlide.points.length - 1)
    }
  }

  const topPercent = parseFloat(activePoint.top)
  const isNearTop = topPercent < 30
  const isNearBottom = topPercent > 75

  // 吹き出しをずらして、矢印オフセット位置がバッジ中心と一致するようにする
  const ARROW_OFFSET = 14
  const popupTransform = isNearTop
    ? `translateY(-${ARROW_OFFSET}px)`
    : isNearBottom
    ? `translateY(calc(-100% + ${ARROW_OFFSET}px))`
    : "translateY(-50%)"

  const arrowVerticalClass = isNearTop
    ? "top-2"
    : isNearBottom
    ? "bottom-2"
    : "top-1/2 -translate-y-1/2"

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0907] overflow-y-auto">
      <div className="w-full max-w-sm mx-auto px-4 py-3 h-[94%] flex flex-col gap-3">

        {/* ヘッダー */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="border border-amber-800/50 rounded-sm px-6 py-1.5 bg-amber-950/20 text-center flex-1">
            <div className="text-amber-700/70 text-xs tracking-[0.3em] uppercase">各ページの見方</div>
            <h2 className="text-amber-300 text-xl font-bold tracking-widest">{slide.page}</h2>
          </div>
          <button
            onClick={onComplete}
            className="bg-red-950 hover:bg-red-900 border border-red-900/60 text-amber-400 text-sm font-semibold rounded-lg px-2 py-2 transition-colors"
            aria-label="とじる"
          >
            スキップ
          </button>
        </div>

        {/* スライド進捗 */}
        <div className="flex justify-center items-center gap-1.5 shrink-0">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === slideIndex
                  ? "w-5 h-1.5 bg-amber-400"
                  : i < slideIndex
                  ? "w-2.5 h-1.5 bg-amber-700"
                  : "w-2.5 h-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* スクショ + バッジ + ポップアップ */}
        <div className="flex-1 min-h-0 flex justify-center">
        <div className="relative h-full">
          <SlideImage
            src={slide.imagePath}
            alt={slide.imageAlt}
            width={slide.imageSize.width}
            height={slide.imageSize.height}
          />

          {/* 薄いオーバーレイ */}
          <div className="absolute inset-0 rounded-xl bg-black/25 pointer-events-none" />

          {/* 全バッジ（右端） */}
          {slide.points.map((point, i) => (
            <div
              key={point.num}
              className="absolute transition-all duration-300"
              style={{ top: point.top, right: "6px", transform: "translateY(-50%)" }}
            >
              <span
                className={`text-xl font-bold rounded-full size-8 flex items-center justify-center border-2 transition-all duration-300 ${
                  i === pointIndex
                    ? "text-zinc-900 bg-amber-400 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110"
                    : "text-amber-600/40 bg-amber-950/50 border-amber-800/30"
                }`}
              >
                {point.num}
              </span>
            </div>
          ))}

          {/* ポップアップカード */}
          <div
            className="absolute left-1 right-11 z-20"
            style={{
              top: activePoint.top,
              transform: popupTransform,
            }}
          >
            <div className="relative bg-zinc-900/95 border border-amber-700/60 rounded-xl px-3 py-2.5 shadow-xl">
              {/* 右向き矢印（バッジへのポインタ） */}
              <div
                className={`absolute right-[-7px] ${arrowVerticalClass} size-3 bg-zinc-900 border-r border-t border-amber-700/60 rotate-45`}
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-zinc-900 bg-amber-400 font-bold text-base rounded-full size-6 flex items-center justify-center shrink-0">
                  {activePoint.num}
                </span>
                <div className="text-amber-300 text-base font-bold leading-tight">{activePoint.label}</div>
              </div>
              <div className="text-neutral-300 text-base leading-relaxed whitespace-pre-line">
                {activePoint.desc}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex flex-col items-center gap-2 shrink-0 pb-2">
          <Button
            onClick={handleNext}
            className="w-full h-10 bg-amber-700 hover:bg-amber-600 text-white text-base"
          >
            {isLast ? "終了" : isLastPoint ? "次のページへ" : "次へ"}
            <ChevronRight size={20} />
          </Button>
          <Button
            onClick={handlePrev}
            disabled={isFirst}
            className="w-full h-10 items-center gap-0.5 text-base bg-neutral-500 text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft size={20} />
            前へ
          </Button>
        </div>

      </div>
    </div>
  )
}
